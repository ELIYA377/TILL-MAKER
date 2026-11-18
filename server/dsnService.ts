import { db, getSetting } from './db.js';

const DSN_BASE_URL = 'https://dsntechnology.co.tz/api/v1';

export function formatDsnPhone(rawPhone: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return '255' + digits.slice(1);
  }
  if (digits.startsWith('255') && digits.length === 12) {
    return digits;
  }
  if ((digits.startsWith('7') || digits.startsWith('6')) && digits.length === 9) {
    return '255' + digits;
  }
  return digits;
}

function getDsnCredentials() {
  const apiKey = (process.env.DSN_API_KEY || '').trim();
  const userId = getSetting('dsn_user_id', process.env.DSN_USER_ID || 'DSN-0036').trim();
  return { apiKey, userId };
}

export interface DsnCollectPayload {
  amount: number;
  customer_phone: string;
  customer_name: string;
  customer_email: string;
  description: string;
}

export interface DsnCollectResult {
  ok: boolean;
  configured: boolean;
  httpStatus: number;
  orderId?: string;
  reference?: string;
  status?: string;
  message: string;
  raw?: any;
}

export async function dsnCollectPayment(
  localOrderId: string,
  payload: DsnCollectPayload
): Promise<DsnCollectResult> {
  const { apiKey, userId } = getDsnCredentials();
  const endpoint = `${DSN_BASE_URL}/collect`;

  const formattedPayload: DsnCollectPayload = {
    ...payload,
    customer_phone: formatDsnPhone(payload.customer_phone),
  };

  if (!apiKey) {
    db.prepare(`
      INSERT INTO payment_logs (order_id, endpoint, http_method, request_payload, response_code, response_body)
      VALUES (?, ?, 'POST', ?, 0, ?)
    `).run(
      localOrderId,
      endpoint,
      JSON.stringify(formattedPayload),
      JSON.stringify({ error: 'DSN_API_KEY is not configured in server environment' })
    );

    return {
      ok: false,
      configured: false,
      httpStatus: 503,
      message: 'DSN Technology API key (DSN_API_KEY) is not configured on the server. Please add DSN_API_KEY in server environment secrets.',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': apiKey,
        'X-User-Id': userId,
      },
      body: JSON.stringify(formattedPayload),
    });

    const rawText = await response.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { rawText };
    }

    const dataObj = parsed?.data || parsed || {};
    const remoteOrderId = String(
      dataObj.order_id ||
      dataObj.orderId ||
      dataObj.order_reference ||
      parsed?.order_id ||
      parsed?.order_reference ||
      ''
    ).trim();
    const reference = String(
      dataObj.reference ||
      dataObj.gateway_reference ||
      dataObj.transaction_id ||
      parsed?.reference ||
      ''
    ).trim();
    const status = String(dataObj.status || parsed?.status || 'Pending');
    const logOrderId = remoteOrderId || localOrderId;

    db.prepare(`
      INSERT INTO payment_logs (order_id, endpoint, http_method, request_payload, response_code, response_body)
      VALUES (?, ?, 'POST', ?, ?, ?)
    `).run(logOrderId, endpoint, JSON.stringify(formattedPayload), response.status, rawText.slice(0, 8000));

    const statusLower = status.toLowerCase();
    if (!response.ok || parsed?.success === false || parsed?.error || ['error', 'failed'].includes(statusLower)) {
      return {
        ok: false,
        configured: true,
        httpStatus: response.status >= 400 ? response.status : 400,
        orderId: remoteOrderId || undefined,
        message: parsed?.message || parsed?.error || `DSN gateway returned HTTP ${response.status}`,
        raw: parsed,
      };
    }

    return {
      ok: true,
      configured: true,
      httpStatus: response.status,
      orderId: remoteOrderId || undefined,
      reference: reference || undefined,
      status,
      message: parsed?.message || 'Payment prompt sent! Please enter your mobile money PIN on your phone to confirm.',
      raw: parsed,
    };
  } catch (err: any) {
    db.prepare(`
      INSERT INTO payment_logs (order_id, endpoint, http_method, request_payload, response_code, response_body)
      VALUES (?, ?, 'POST', ?, 500, ?)
    `).run(localOrderId, endpoint, JSON.stringify(payload), JSON.stringify({ error: err?.message || 'Network failure' }));

    return {
      ok: false,
      configured: true,
      httpStatus: 502,
      message: `Unable to reach DSN Technology gateway: ${err?.message || 'Network error'}`,
    };
  }
}

export interface DsnStatusResult {
  ok: boolean;
  configured: boolean;
  httpStatus: number;
  normalizedStatus: 'Pending' | 'Success' | 'Failed';
  verifiedAmount?: number;
  reference?: string;
  message: string;
  raw?: any;
}

export async function dsnCheckStatus(orderId: string, localOrderId: string): Promise<DsnStatusResult> {
  const { apiKey, userId } = getDsnCredentials();
  const endpoint = `${DSN_BASE_URL}/status/${encodeURIComponent(orderId)}`;

  if (!apiKey) {
    return {
      ok: false,
      configured: false,
      httpStatus: 503,
      normalizedStatus: 'Pending',
      message: 'DSN_API_KEY is not configured on the server.',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'X-User-Id': userId,
      },
    });

    const rawText = await response.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { rawText };
    }

    db.prepare(`
      INSERT INTO payment_logs (order_id, endpoint, http_method, request_payload, response_code, response_body)
      VALUES (?, ?, 'GET', ?, ?, ?)
    `).run(localOrderId, endpoint, '', response.status, rawText.slice(0, 8000));

    if (!response.ok) {
      return {
        ok: false,
        configured: true,
        httpStatus: response.status,
        normalizedStatus: 'Pending',
        message: parsed?.message || `DSN status check returned HTTP ${response.status}`,
        raw: parsed,
      };
    }

    const dataObj = parsed?.data || parsed || {};
    const rawStatus = String(
      dataObj.payment_status ||
      dataObj.transaction_status ||
      dataObj.status ||
      parsed?.payment_status ||
      parsed?.status ||
      'pending'
    ).toLowerCase();

    let normalizedStatus: 'Pending' | 'Success' | 'Failed' = 'Pending';
    if (['success', 'successful', 'completed', 'complete', 'paid', 'settled', 'approved'].includes(rawStatus)) {
      normalizedStatus = 'Success';
    } else if (['failed', 'cancelled', 'canceled', 'expired', 'rejected', 'error'].includes(rawStatus)) {
      normalizedStatus = 'Failed';
    }

    const amountVal = Number(dataObj.amount ?? dataObj.paid_amount ?? dataObj.amount_paid ?? parsed?.amount);
    const reference = String(
      dataObj.reference ||
      dataObj.gateway_reference ||
      dataObj.transaction_id ||
      dataObj.mpesa_receipt ||
      parsed?.reference ||
      ''
    );

    return {
      ok: true,
      configured: true,
      httpStatus: response.status,
      normalizedStatus,
      verifiedAmount: Number.isFinite(amountVal) && amountVal > 0 ? amountVal : undefined,
      reference: reference || undefined,
      message: parsed?.message || `Payment status: ${normalizedStatus}`,
      raw: parsed,
    };
  } catch (err: any) {
    return {
      ok: false,
      configured: true,
      httpStatus: 502,
      normalizedStatus: 'Pending',
      message: `DSN status lookup failed: ${err?.message || 'Network error'}`,
    };
  }
}

export interface DsnBalanceResult {
  ok: boolean;
  configured: boolean;
  connectionStatus: 'Connected' | 'Not Configured' | 'Error';
  availableBalance: number | null;
  pendingFunds: number | null;
  reservedForWithdrawals: number | null;
  totalCollected: number | null;
  totalCollectionFees: number | null;
  totalNetEarnings: number | null;
  checkedAt: string;
  message: string;
}

export async function dsnFetchMerchantBalance(adminId: number): Promise<DsnBalanceResult> {
  const { apiKey, userId } = getDsnCredentials();
  const endpoint = `${DSN_BASE_URL}/balance`;
  const checkedAt = new Date().toISOString();

  if (!apiKey) {
    db.prepare(`
      INSERT INTO merchant_balance_logs (api_status, raw_response, checked_by)
      VALUES ('Not Configured', ?, ?)
    `).run(JSON.stringify({ error: 'DSN_API_KEY not set' }), adminId);

    return {
      ok: false,
      configured: false,
      connectionStatus: 'Not Configured',
      availableBalance: null,
      pendingFunds: null,
      reservedForWithdrawals: null,
      totalCollected: null,
      totalCollectionFees: null,
      totalNetEarnings: null,
      checkedAt,
      message: 'DSN_API_KEY is not configured in server environment secrets. Add DSN_API_KEY to enable live merchant balance sync.',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'X-User-Id': userId,
      },
    });

    const rawText = await response.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { rawText };
    }

    if (!response.ok || parsed?.success === false) {
      db.prepare(`
        INSERT INTO merchant_balance_logs (api_status, raw_response, checked_by)
        VALUES ('Error', ?, ?)
      `).run(rawText.slice(0, 8000), adminId);

      return {
        ok: false,
        configured: true,
        connectionStatus: 'Error',
        availableBalance: null,
        pendingFunds: null,
        reservedForWithdrawals: null,
        totalCollected: null,
        totalCollectionFees: null,
        totalNetEarnings: null,
        checkedAt,
        message: parsed?.message || parsed?.error || `DSN Balance API returned HTTP ${response.status}`,
      };
    }

    const d = parsed?.data || parsed || {};
    const num = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const availableBalance = num(d.available_balance ?? d.availableBalance ?? d.balance);
    const pendingFunds = num(d.pending_funds ?? d.pendingFunds ?? d.pending_balance);
    const reservedForWithdrawals = num(d.reserved_for_withdrawals ?? d.reservedForWithdrawals ?? d.reserved);
    const totalCollected = num(d.total_collected ?? d.totalCollected);
    const totalCollectionFees = num(d.total_collection_fees ?? d.totalCollectionFees ?? d.total_fees);
    const totalNetEarnings = num(d.total_net_earnings ?? d.totalNetEarnings ?? d.net_earnings);

    db.prepare(`
      INSERT INTO merchant_balance_logs (
        available_balance, pending_funds, reserved_withdrawals,
        total_collected, total_collection_fees, total_net_earnings,
        api_status, raw_response, checked_by
      ) VALUES (?, ?, ?, ?, ?, ?, 'Connected', ?, ?)
    `).run(
      availableBalance,
      pendingFunds,
      reservedForWithdrawals,
      totalCollected,
      totalCollectionFees,
      totalNetEarnings,
      rawText.slice(0, 8000),
      adminId
    );

    return {
      ok: true,
      configured: true,
      connectionStatus: 'Connected',
      availableBalance,
      pendingFunds,
      reservedForWithdrawals,
      totalCollected,
      totalCollectionFees,
      totalNetEarnings,
      checkedAt,
      message: 'Live merchant balance retrieved from DSN Technology.',
    };
  } catch (err: any) {
    db.prepare(`
      INSERT INTO merchant_balance_logs (api_status, raw_response, checked_by)
      VALUES ('Error', ?, ?)
    `).run(JSON.stringify({ error: err?.message || 'Network failure' }), adminId);

    return {
      ok: false,
      configured: true,
      connectionStatus: 'Error',
      availableBalance: null,
      pendingFunds: null,
      reservedForWithdrawals: null,
      totalCollected: null,
      totalCollectionFees: null,
      totalNetEarnings: null,
      checkedAt,
      message: `Failed to connect to DSN Technology API: ${err?.message || 'Network error'}`,
    };
  }
}

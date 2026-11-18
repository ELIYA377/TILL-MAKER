import { lookupNidaRecord, detectCarrier } from '../data/mockRecords';
import { SinsoftApiResponse, NidaRecord } from '../types';
import { SystemStore, REQUEST_COST_TSH } from './systemStore';

export interface SinsoftLookupOptions {
  query: string;
  apiKey?: string;
  userPhone?: string;
  deductCredit?: boolean;
}

export function formatSinsoftRecord(record: NidaRecord, query: string, remainingBalance: number, charge: number, latencyMs: number): SinsoftApiResponse {
  const primaryCarrier = detectCarrier(record.primaryPhone);
  const rawNin = record.nin.replace(/\D/g, '');
  const isPhone = /^(\+?255|0)[67]\d{8}$/.test(query.trim());
  const queryType = isPhone ? 'phone' : (/^\d+$/.test(query.replace(/\D/g, '')) && query.replace(/\D/g, '').length >= 10 ? 'nin' : 'name');

  // Realistic Tanzania NIDA QR code and security checksum
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fsinsoft.online%2Fid%2Fverify.php%3Fnin%3D${encodeURIComponent(record.nin)}%26hash%3D${record.securityChecksum.slice(0, 12)}`;

  return {
    status: 200,
    success: true,
    message: 'NIDA Record retrieved successfully from Central Identification Registry',
    query: query,
    query_type: queryType,
    charge: charge,
    remaining_balance: remainingBalance,
    timestamp: new Date().toISOString(),
    execution_time_ms: latencyMs,
    data: {
      nin: record.nin,
      nin_raw: rawNin,
      first_name: record.firstName,
      middle_name: record.middleName || '',
      last_name: record.lastName,
      full_name: record.fullName,
      gender: record.gender,
      date_of_birth: record.dateOfBirth,
      age: record.age,
      nationality: record.nationality || 'TANZANIAN',
      citizenship_type: record.citizenshipType || 'CITIZEN BY BIRTH',
      phone: record.primaryPhone,
      carrier: primaryCarrier,
      registered_sims: record.registeredSims.map((sim) => ({
        msisdn: sim.msisdn,
        carrier: sim.carrier,
        biometric_status: sim.biometricStatus,
        registration_date: sim.registrationDate,
      })),
      place_of_birth: {
        region: record.placeOfBirth.region,
        district: record.placeOfBirth.district,
        ward: record.placeOfBirth.ward,
      },
      residence: {
        region: record.residence.region,
        district: record.residence.district,
        ward: record.residence.ward,
        street: record.residence.street,
      },
      biometrics: {
        fingerprint_enrolled: record.fingerprintEnrolled,
        facial_matched: record.facialRecognitionMatched,
        status: 'VERIFIED_OK',
      },
      verification_status: record.verificationStatus,
      document_number: record.documentNumber,
      issue_date: record.issueDate,
      expiry_date: record.expiryDate,
      photo_url: record.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      signature_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png',
      qr_code_url: qrCodeUrl,
      security_checksum: record.securityChecksum || `SHA256:${Math.random().toString(16).substring(2, 14).toUpperCase()}`,
    },
  };
}

export function executeSinsoftLookup(options: SinsoftLookupOptions): SinsoftApiResponse {
  const startTime = performance.now();
  const cleanQuery = options.query?.trim() || '';

  if (!cleanQuery) {
    return {
      status: 400,
      success: false,
      message: 'Parameta ya kutafuta inahitajika (nin au phone)',
      query: '',
      query_type: 'unknown',
      charge: 0,
      remaining_balance: 0,
      timestamp: new Date().toISOString(),
      execution_time_ms: 2,
      data: null,
    };
  }

  // Determine user from phone or API key
  let user = options.userPhone ? SystemStore.getUser(options.userPhone) : null;
  if (!user && options.apiKey) {
    const allUsers = SystemStore.getUsers();
    user = allUsers.find((u) => u.apiKey === options.apiKey) || null;
  }
  if (!user) {
    user = SystemStore.getCurrentUser();
  }

  const deduct = options.deductCredit !== false;
  const cost = deduct ? REQUEST_COST_TSH : 0;

  // Check balance if user exists and deduction is enabled
  if (user && deduct && user.credit < cost) {
    return {
      status: 402,
      success: false,
      message: `Salio halitoshi kufanya lookup hii. Gharama ni TSh ${cost.toFixed(2)}, lakini salio lako ni TSh ${user.credit.toFixed(2)}. Tafadhali weka salio.`,
      query: cleanQuery,
      query_type: 'unknown',
      charge: 0,
      remaining_balance: user.credit,
      timestamp: new Date().toISOString(),
      execution_time_ms: Math.round(performance.now() - startTime),
      data: null,
    };
  }

  // Execute lookup
  const lookupRes = lookupNidaRecord(cleanQuery);
  const record = lookupRes.record;

  if (!record) {
    return {
      status: 404,
      success: false,
      message: 'Taarifa za NIDA hazikupatikana kwa namba au kitambulisho hiki.',
      query: cleanQuery,
      query_type: lookupRes.matchedBy || 'unknown',
      charge: 0,
      remaining_balance: user ? user.credit : 0,
      timestamp: new Date().toISOString(),
      execution_time_ms: Math.round(performance.now() - startTime),
      data: null,
    };
  }

  // Deduct credit if user exists and deduct is true
  let remaining = user ? user.credit : 0;
  if (user && deduct) {
    const deduction = SystemStore.deductUserCredit(user.phone, cost);
    if (deduction.success) {
      remaining = deduction.newBalance;
    }
  }

  const latencyMs = Math.max(18, Math.round(performance.now() - startTime + 15));

  // Log API call
  if (user) {
    SystemStore.logApiCall({
      userPhone: user.phone,
      endpoint: '/id/lookup.php',
      query: cleanQuery,
      queryType: (lookupRes.matchedBy as any) || 'nin',
      statusCode: 200,
      cost: cost,
      latencyMs: latencyMs,
    });
  }

  return formatSinsoftRecord(record, cleanQuery, remaining, cost, latencyMs);
}

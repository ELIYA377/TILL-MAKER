import { NidaServiceRequest } from '../types';

const REQUESTS_STORAGE_KEY = 'nida_service_requests_v1';
const WALLET_STORAGE_KEY = 'nida_user_wallet_tokens_v1';
const CURRENT_USER_PHONE_KEY = 'nida_current_user_phone_v1';

// Initial pre-loaded seed requests for seamless demo & testing
const DEFAULT_REQUESTS: NidaServiceRequest[] = [
  {
    id: 'REQ-1710001',
    userId: 'USR-0784615052',
    userPhone: '0784615052',
    targetPhone: '0784615052',
    applicantName: 'ELIYA AMOS MWAKYUSA',
    timestamp: Date.now() - 7200000, // 2 hours ago
    status: 'Completed',
    nidaNumber: '19941208-14205-00129-22',
    completedAt: Date.now() - 3600000,
    adminNotes: 'NIDA imepatikana kwenye rejista ya TCRA/NIDA ya mwaka 2022.',
    costTokens: 1,
  },
  {
    id: 'REQ-1710002',
    userId: 'USR-0784615052',
    userPhone: '0784615052',
    targetPhone: '0655112233',
    applicantName: 'AMINA RASHID SAID',
    timestamp: Date.now() - 1800000, // 30 mins ago
    status: 'Pending',
    costTokens: 1,
  },
];

// Initial default token count
const DEFAULT_TOKENS = 3;
const DEFAULT_USER_PHONE = '0784615052';

export const RequestStore = {
  // Get all requests
  getRequests(): NidaServiceRequest[] {
    try {
      const data = localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    // Save default initial records
    this.saveRequests(DEFAULT_REQUESTS);
    return DEFAULT_REQUESTS;
  },

  // Save requests
  saveRequests(requests: NidaServiceRequest[]): void {
    try {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
      window.dispatchEvent(new CustomEvent('nida_requests_updated', { detail: requests }));
    } catch {
      // ignore
    }
  },

  // Get current user's wallet token balance
  getTokens(): number {
    try {
      const saved = localStorage.getItem(WALLET_STORAGE_KEY);
      if (saved !== null) {
        const val = parseInt(saved, 10);
        return isNaN(val) ? DEFAULT_TOKENS : val;
      }
    } catch {
      // fallback
    }
    this.setTokens(DEFAULT_TOKENS);
    return DEFAULT_TOKENS;
  },

  // Set tokens
  setTokens(amount: number): void {
    const safeAmount = Math.max(0, amount);
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, safeAmount.toString());
      window.dispatchEvent(new CustomEvent('nida_wallet_updated', { detail: safeAmount }));
    } catch {
      // ignore
    }
  },

  // Deduct 1 token for an ombi
  deductToken(count = 1): boolean {
    const current = this.getTokens();
    if (current < count) return false;
    this.setTokens(current - count);
    return true;
  },

  // Top up tokens
  addTokens(count: number): number {
    const current = this.getTokens();
    const updated = current + count;
    this.setTokens(updated);
    return updated;
  },

  // Current user's phone identifier
  getUserPhone(): string {
    try {
      const saved = localStorage.getItem(CURRENT_USER_PHONE_KEY);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return DEFAULT_USER_PHONE;
  },

  setUserPhone(phone: string): void {
    try {
      localStorage.setItem(CURRENT_USER_PHONE_KEY, phone);
      window.dispatchEvent(new CustomEvent('nida_user_updated', { detail: phone }));
    } catch {
      // ignore
    }
  },

  // Submit a new NIDA request
  submitRequest(targetPhone: string, applicantName?: string, userPhoneOverride?: string): { success: boolean; request?: NidaServiceRequest; error?: string } {
    const currentTokens = this.getTokens();
    if (currentTokens < 1) {
      return {
        success: false,
        error: 'Salio la token halitoshi! Kila ombi linagharimu token 1 (Tshs 200). Tafadhali weka salio.',
      };
    }

    const cleanTargetPhone = targetPhone.replace(/\s+/g, '').trim();
    if (!cleanTargetPhone || cleanTargetPhone.length < 9) {
      return {
        success: false,
        error: 'Tafadhali weka namba sahihi ya simu ya Tanzania (mf. 0784615052).',
      };
    }

    const userPhone = userPhoneOverride || this.getUserPhone();
    const userId = `USR-${userPhone}`;

    // Deduct 1 token
    this.deductToken(1);

    const newRequest: NidaServiceRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      userId,
      userPhone,
      targetPhone: cleanTargetPhone,
      applicantName: applicantName?.trim() || undefined,
      timestamp: Date.now(),
      status: 'Pending',
      costTokens: 1,
    };

    const requests = this.getRequests();
    const updated = [newRequest, ...requests];
    this.saveRequests(updated);

    return {
      success: true,
      request: newRequest,
    };
  },

  // Admin completes request by providing NIDA number
  completeRequest(requestId: string, nidaNumber: string, adminNotes?: string): { success: boolean; error?: string } {
    const cleanNin = nidaNumber.trim();
    if (!cleanNin || cleanNin.length < 10) {
      return {
        success: false,
        error: 'Tafadhali weka namba sahihi ya NIDA (NIN yenye tarakimu 20, mf. 19941208-14205-00129-22).',
      };
    }

    const requests = this.getRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) {
      return {
        success: false,
        error: 'Ombi halikupatikana.',
      };
    }

    requests[index] = {
      ...requests[index],
      status: 'Completed',
      nidaNumber: cleanNin,
      completedAt: Date.now(),
      adminNotes: adminNotes || 'NIDA imehakikiwa na kupatiwa kikamilifu.',
    };

    this.saveRequests(requests);
    return { success: true };
  },

  // Reset or seed requests
  resetData(): void {
    this.saveRequests(DEFAULT_REQUESTS);
    this.setTokens(DEFAULT_TOKENS);
  }
};

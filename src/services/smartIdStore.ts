import { NidaRecord, VerificationStatus, TelecomAgentProfile, TelecomCarrier, TelecomIdType } from '../types';
import { INITIAL_MOCK_RECORDS } from '../data/mockRecords';
import { INITIAL_TELECOM_AGENTS } from '../data/mockTelecomAgents';
import avatarPhoto from '../assets/images/avatar_citizen_verified_1790750468089.jpg';

const CITIZENS_STORAGE_KEY = 'smart_id_citizens_v2';
const TELECOM_AGENTS_STORAGE_KEY = 'smart_id_telecom_agents_v2';
const AUDIT_LOG_KEY = 'smart_id_audit_v2';
const CARRIER_CUSTOM_LOGOS_KEY = 'smart_id_telecom_custom_logos_v2';
const CITIZEN_DEFAULT_LOGO_KEY = 'smart_id_citizen_custom_logo_v2';

export interface AuditLog {
  id: string;
  action: 'REGISTRATION' | 'VERIFICATION' | 'STATUS_CHANGE' | 'PRINT_CARD' | 'SYSTEM_RESET';
  actor: string;
  details: string;
  timestamp: number;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export const SmartIdStore = {
  getCitizens(): NidaRecord[] {
    try {
      const data = localStorage.getItem(CITIZENS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    // Default Seed with photo assigned
    const seeded = INITIAL_MOCK_RECORDS.map((rec, i) => ({
      ...rec,
      avatarUrl: rec.avatarUrl || avatarPhoto,
      verificationStatus: (i === 1 ? 'PENDING_UPDATE' : i === 2 ? 'PROVISIONAL' : 'VERIFIED') as VerificationStatus,
    }));
    this.saveCitizens(seeded);
    return seeded;
  },

  saveCitizens(records: NidaRecord[]): void {
    try {
      localStorage.setItem(CITIZENS_STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent('smart_id_citizens_changed', { detail: records }));
    } catch {
      // ignore
    }
  },

  getCitizenByNin(nin: string): NidaRecord | undefined {
    if (!nin) return undefined;
    const clean = nin.replace(/\D/g, '');
    return this.getCitizens().find((c) => {
      const cClean = c.nin.replace(/\D/g, '');
      return c.nin === nin || cClean === clean;
    });
  },

  searchCitizens(query: string, statusFilter: string = 'ALL'): NidaRecord[] {
    const list = this.getCitizens();
    const q = query.trim().toLowerCase();
    const qDigits = query.replace(/\D/g, '');

    return list.filter((c) => {
      // Filter by status if not ALL
      if (statusFilter !== 'ALL' && c.verificationStatus !== statusFilter) {
        return false;
      }

      if (!q) return true;

      const nameMatch = c.fullName.toLowerCase().includes(q);
      const ninClean = c.nin.replace(/\D/g, '');
      const ninMatch = c.nin.toLowerCase().includes(q) || (qDigits.length > 3 && ninClean.includes(qDigits));
      const phoneMatch = c.primaryPhone.includes(qDigits);
      const regionMatch = c.residence.region.toLowerCase().includes(q);

      return nameMatch || ninMatch || phoneMatch || regionMatch;
    });
  },

  registerCitizen(data: {
    fullName: string;
    nin?: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE';
    phone: string;
    avatarUrl?: string;
    region: string;
    district: string;
    ward: string;
    street: string;
    citizenshipType?: 'CITIZEN BY BIRTH' | 'CITIZEN BY REGISTRATION' | 'CITIZEN BY NATURALIZATION';
    customLogoUrl?: string;
  }): { success: boolean; message: string; record?: NidaRecord } {
    const existing = this.getCitizens();

    // Generate standardized NIN if not supplied
    let finalNin = (data.nin || '').trim();
    if (!finalNin) {
      const birthYear = data.dateOfBirth.split('-')[0] || '1995';
      const birthMonth = data.dateOfBirth.split('-')[1] || '06';
      const birthDay = data.dateOfBirth.split('-')[2] || '15';
      const randomSuffix1 = Math.floor(10000 + Math.random() * 90000);
      const randomSuffix2 = Math.floor(10000 + Math.random() * 90000);
      const randomSuffix3 = Math.floor(10 + Math.random() * 89);
      finalNin = `${birthYear}${birthMonth}${birthDay}-${randomSuffix1}-${randomSuffix2}-${randomSuffix3}`;
    }

    // Check duplicate NIN
    const cleanNin = finalNin.replace(/\D/g, '');
    if (existing.some((c) => c.nin.replace(/\D/g, '') === cleanNin)) {
      return { success: false, message: 'NIN already registered in civil database!' };
    }

    const names = data.fullName.trim().split(' ');
    const firstName = names[0] || 'CITIZEN';
    const lastName = names[names.length - 1] || 'TANZANIAN';
    const middleName = names.length > 2 ? names.slice(1, -1).join(' ') : undefined;

    const birthYearNum = parseInt(data.dateOfBirth.split('-')[0]) || 1995;
    const age = Math.max(1, new Date().getFullYear() - birthYearNum);

    const newRecord: NidaRecord = {
      id: `smart-${Date.now()}`,
      nin: finalNin,
      fullName: data.fullName.toUpperCase().trim(),
      firstName: firstName.toUpperCase(),
      middleName: middleName ? middleName.toUpperCase() : undefined,
      lastName: lastName.toUpperCase(),
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      age,
      primaryPhone: data.phone,
      registeredSims: [
        {
          msisdn: data.phone,
          carrier: data.phone.startsWith('075') ? 'Vodacom' : data.phone.startsWith('071') ? 'Tigo' : 'Airtel',
          biometricStatus: 'BIOMETRIC_VERIFIED',
          registrationDate: new Date().toISOString().split('T')[0],
          simSerial: `892550${Date.now().toString().slice(-10)}`,
          isPrimary: true,
        }
      ],
      placeOfBirth: {
        region: data.region.toUpperCase(),
        district: data.district.toUpperCase(),
        ward: data.ward.toUpperCase(),
      },
      nationality: 'TANZANIAN',
      citizenshipType: data.citizenshipType || 'CITIZEN BY BIRTH',
      verificationStatus: 'VERIFIED',
      statusNotes: 'Biometrically registered and cleared through smart civil portal.',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: `${new Date().getFullYear() + 10}-12-31`,
      documentNumber: `TZ-NID-${Math.floor(10000000 + Math.random() * 90000000)}`,
      fingerprintEnrolled: true,
      facialRecognitionMatched: true,
      securityChecksum: `SHA256:${Math.random().toString(36).substring(2, 15).toUpperCase()}...`,
      residence: {
        region: data.region.toUpperCase(),
        district: data.district.toUpperCase(),
        ward: data.ward.toUpperCase(),
        street: data.street.toUpperCase() || 'MAIN STREET',
      },
      avatarUrl: data.avatarUrl || avatarPhoto,
      customLogoUrl: data.customLogoUrl,
    };

    existing.unshift(newRecord);
    this.saveCitizens(existing);

    this.logAudit({
      action: 'REGISTRATION',
      actor: 'Admin / Registration Officer',
      details: `New citizen registered: ${newRecord.fullName} (NIN: ${newRecord.nin})`,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Citizen registered successfully! Digital ID card has been generated.',
      record: newRecord,
    };
  },

  updateStatus(nin: string, newStatus: VerificationStatus): boolean {
    const list = this.getCitizens();
    const idx = list.findIndex((c) => c.nin === nin);
    if (idx === -1) return false;

    list[idx].verificationStatus = newStatus;
    this.saveCitizens(list);

    this.logAudit({
      action: 'STATUS_CHANGE',
      actor: 'System Officer',
      details: `Status of ${list[idx].fullName} (${nin}) changed to ${newStatus}`,
      status: 'SUCCESS',
    });
    return true;
  },

  deleteCitizen(nin: string): boolean {
    const list = this.getCitizens();
    const filtered = list.filter((c) => c.nin !== nin);
    if (filtered.length === list.length) return false;
    this.saveCitizens(filtered);
    return true;
  },

  verifyIdentity(query: string): {
    authentic: boolean;
    record?: NidaRecord;
    message: string;
    confidence: number;
    timestamp: number;
  } {
    const clean = query.trim();
    if (!clean) {
      return {
        authentic: false,
        message: 'No identification input provided.',
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    const cleanDigits = clean.replace(/\D/g, '');
    const citizens = this.getCitizens();

    // Check by NIN, Phone, or QR code JSON
    let found: NidaRecord | undefined;

    // Check if JSON QR payload
    if (clean.startsWith('{') && clean.includes('nin')) {
      try {
        const parsed = JSON.parse(clean);
        if (parsed.nin) {
          found = citizens.find((c) => c.nin.replace(/\D/g, '') === parsed.nin.replace(/\D/g, ''));
        }
      } catch {}
    }

    if (!found) {
      found = citizens.find((c) => {
        const cDigits = c.nin.replace(/\D/g, '');
        return (
          c.nin.toLowerCase() === clean.toLowerCase() ||
          (cleanDigits.length >= 10 && cDigits === cleanDigits) ||
          c.primaryPhone.replace(/\D/g, '') === cleanDigits ||
          c.fullName.toLowerCase() === clean.toLowerCase() ||
          c.documentNumber.toLowerCase() === clean.toLowerCase()
        );
      });
    }

    if (found) {
      const isSuspended = found.verificationStatus === 'RESTRICTED';
      this.logAudit({
        action: 'VERIFICATION',
        actor: 'Verification Portal Scanner',
        details: `Query: ${clean} -> Matched: ${found.fullName} (${found.nin}) [${found.verificationStatus}]`,
        status: isSuspended ? 'WARNING' : 'SUCCESS',
      });

      return {
        authentic: !isSuspended,
        record: found,
        message: isSuspended
          ? 'Identity record found but clearance is RESTRICTED/SUSPENDED by civil authority.'
          : 'Identity is AUTHENTIC and ACTIVE in the national civil registry.',
        confidence: 99.8,
        timestamp: Date.now(),
      };
    }

    this.logAudit({
      action: 'VERIFICATION',
      actor: 'Verification Portal Scanner',
      details: `Failed verification check for input: ${clean}`,
      status: 'FAILED',
    });

    return {
      authentic: false,
      message: 'Identification number not found or unverified in civil registry.',
      confidence: 0,
      timestamp: Date.now(),
    };
  },

  getMetrics() {
    const citizens = this.getCitizens();
    const total = citizens.length;
    const active = citizens.filter((c) => c.verificationStatus === 'VERIFIED').length;
    const pending = citizens.filter((c) => c.verificationStatus === 'PENDING_UPDATE' || c.verificationStatus === 'PROVISIONAL').length;
    const restricted = citizens.filter((c) => c.verificationStatus === 'RESTRICTED').length;

    return {
      total,
      active,
      pending,
      restricted,
      uptime: '99.98%',
      securityLevel: 'TLS 1.3 / PKI 256-Bit',
      tcraSyncStatus: 'ONLINE (SYNCED)',
      lastAuditCheck: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
  },

  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(AUDIT_LOG_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    const seed: AuditLog[] = [
      {
        id: 'LOG-991',
        action: 'VERIFICATION',
        actor: 'Border Control / Gateway Terminal',
        details: 'QR Pass verification scan for PASIKARI JACKOBO PASIKARI (19990102455240000122). Result: VALID.',
        timestamp: Date.now() - 6 * 60000,
        status: 'SUCCESS',
      },
      {
        id: 'LOG-990',
        action: 'REGISTRATION',
        actor: 'Desk Officer Dodoma',
        details: 'Issued new biometric credential for JUMA HAMISI BAKARI (19900315-11103-00001-21).',
        timestamp: Date.now() - 35 * 60000,
        status: 'SUCCESS',
      },
      {
        id: 'LOG-989',
        action: 'STATUS_CHANGE',
        actor: 'Superintendent Eliya Amos',
        details: 'Verified national identification status cleared for TCRA carrier link.',
        timestamp: Date.now() - 2 * 3600000,
        status: 'SUCCESS',
      },
      {
        id: 'LOG-988',
        action: 'PRINT_CARD',
        actor: 'Citizen Self-Service Desk',
        details: 'Printed official civil verification slip for ELIYA AMOS MWAKYUSA.',
        timestamp: Date.now() - 5 * 3600000,
        status: 'SUCCESS',
      },
    ];
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(seed));
    return seed;
  },

  logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    try {
      const logs = this.getAuditLogs();
      const newEntry: AuditLog = {
        ...entry,
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: Date.now(),
      };
      logs.unshift(newEntry);
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs.slice(0, 80)));
    } catch {}
  },

  getTelecomAgents(): TelecomAgentProfile[] {
    try {
      const data = localStorage.getItem(TELECOM_AGENTS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    this.saveTelecomAgents(INITIAL_TELECOM_AGENTS);
    return INITIAL_TELECOM_AGENTS;
  },

  saveTelecomAgents(agents: TelecomAgentProfile[]): void {
    try {
      localStorage.setItem(TELECOM_AGENTS_STORAGE_KEY, JSON.stringify(agents));
      window.dispatchEvent(new CustomEvent('smart_id_telecom_agents_changed', { detail: agents }));
    } catch {}
  },

  getTelecomAgentById(id: string): TelecomAgentProfile | undefined {
    return this.getTelecomAgents().find((a) => a.id === id || a.agentCode === id || a.tillNumber === id);
  },

  searchTelecomAgents(query: string, carrierFilter: string = 'ALL', typeFilter: string = 'ALL'): TelecomAgentProfile[] {
    const list = this.getTelecomAgents();
    const q = query.trim().toLowerCase();
    const qDigits = query.replace(/\D/g, '');

    return list.filter((a) => {
      if (carrierFilter !== 'ALL' && a.carrier !== carrierFilter) return false;
      if (typeFilter !== 'ALL' && a.idType !== typeFilter) return false;
      if (!q) return true;

      const nameMatch = a.ownerName.toLowerCase().includes(q);
      const codeMatch = a.agentCode.toLowerCase().includes(q);
      const tillMatch = a.tillNumber?.includes(qDigits) || false;
      const phoneMatch = a.assignedPhone.includes(qDigits);
      const ninMatch = a.nin.includes(qDigits) || a.nin.toLowerCase().includes(q);
      const branchMatch = a.branchName.toLowerCase().includes(q);
      const regionMatch = a.operatingRegion.toLowerCase().includes(q);

      return nameMatch || codeMatch || tillMatch || phoneMatch || ninMatch || branchMatch || regionMatch;
    });
  },

  registerTelecomAgent(data: {
    carrier: TelecomCarrier;
    idType: TelecomIdType;
    ownerName: string;
    nin: string;
    assignedPhone: string;
    branchName: string;
    operatingRegion: string;
    tillNumber?: string;
    employeeId?: string;
    avatarUrl?: string;
    customLogoUrl?: string;
  }): { success: boolean; message: string; record?: TelecomAgentProfile } {
    const agents = this.getTelecomAgents();
    const rand = Math.floor(10000 + Math.random() * 90000);
    const carrierPrefix = data.carrier.slice(0, 3).toUpperCase();
    const typePrefix = data.idType === 'WAKALA' ? 'WAK' : data.idType === 'SIM_REGISTRAR' ? 'REG' : data.idType === 'STAFF' ? 'STAFF' : 'SUB';
    const agentCode = `${carrierPrefix}-${typePrefix}-${rand}`;

    const newAgent: TelecomAgentProfile = {
      id: `agent-${carrierPrefix.toLowerCase()}-${Date.now()}`,
      carrier: data.carrier,
      idType: data.idType,
      agentCode,
      tillNumber: data.tillNumber || (data.idType === 'WAKALA' ? String(Math.floor(400000 + Math.random() * 500000)) : undefined),
      employeeId: data.employeeId || (data.idType === 'STAFF' ? `EMP-${rand}` : undefined),
      tcraLicenseNumber: `TCRA/${carrierPrefix}/${typePrefix}/2024/${rand.toString().slice(0, 4)}`,
      branchName: data.branchName,
      operatingRegion: data.operatingRegion,
      assignedPhone: data.assignedPhone,
      ownerName: data.ownerName.toUpperCase(),
      nin: data.nin,
      avatarUrl: data.avatarUrl || avatarPhoto,
      customLogoUrl: data.customLogoUrl,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      securityBarcode: `${carrierPrefix}${rand}TZ`,
    };

    agents.unshift(newAgent);
    this.saveTelecomAgents(agents);

    this.logAudit({
      action: 'REGISTRATION',
      actor: `Telecom Registrar (${data.carrier})`,
      details: `Issued ${data.idType} Card: ${agentCode} for ${data.ownerName}.`,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: `Kitambulisho cha ${data.carrier} (${data.idType}) kimetoholewa kikamilifu!`,
      record: newAgent,
    };
  },

  updateTelecomAgentLogo(id: string, logoUrl?: string): boolean {
    const list = this.getTelecomAgents();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    list[idx].customLogoUrl = logoUrl;
    this.saveTelecomAgents(list);
    return true;
  },

  updateCitizenLogo(nin: string, logoUrl?: string): boolean {
    const list = this.getCitizens();
    const idx = list.findIndex((c) => c.nin === nin);
    if (idx === -1) return false;
    list[idx].customLogoUrl = logoUrl;
    this.saveCitizens(list);
    return true;
  },

  getCustomCarrierLogos(): Partial<Record<TelecomCarrier, string>> {
    try {
      const data = localStorage.getItem(CARRIER_CUSTOM_LOGOS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getCarrierLogo(carrier: TelecomCarrier): string | undefined {
    const custom = this.getCustomCarrierLogos();
    return custom[carrier];
  },

  setCustomCarrierLogo(carrier: TelecomCarrier, logoDataUrl: string): void {
    try {
      const current = this.getCustomCarrierLogos();
      current[carrier] = logoDataUrl;
      localStorage.setItem(CARRIER_CUSTOM_LOGOS_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('smart_id_carrier_logos_changed', { detail: current }));
    } catch {}
  },

  resetCustomCarrierLogo(carrier: TelecomCarrier): void {
    try {
      const current = this.getCustomCarrierLogos();
      delete current[carrier];
      localStorage.setItem(CARRIER_CUSTOM_LOGOS_KEY, JSON.stringify(current));
      window.dispatchEvent(new CustomEvent('smart_id_carrier_logos_changed', { detail: current }));
    } catch {}
  },

  resetAllCarrierLogos(): void {
    try {
      localStorage.removeItem(CARRIER_CUSTOM_LOGOS_KEY);
      window.dispatchEvent(new CustomEvent('smart_id_carrier_logos_changed', { detail: {} }));
    } catch {}
  },

  getDefaultCitizenLogo(): string | undefined {
    try {
      return localStorage.getItem(CITIZEN_DEFAULT_LOGO_KEY) || undefined;
    } catch {
      return undefined;
    }
  },

  setDefaultCitizenLogo(logoDataUrl: string): void {
    try {
      localStorage.setItem(CITIZEN_DEFAULT_LOGO_KEY, logoDataUrl);
      window.dispatchEvent(new CustomEvent('smart_id_citizen_logo_changed', { detail: logoDataUrl }));
    } catch {}
  },

  resetDefaultCitizenLogo(): void {
    try {
      localStorage.removeItem(CITIZEN_DEFAULT_LOGO_KEY);
      window.dispatchEvent(new CustomEvent('smart_id_citizen_logo_changed', { detail: null }));
    } catch {}
  },

  getTelecomStats() {
    const agents = this.getTelecomAgents();
    const carriers: TelecomCarrier[] = ['Vodacom', 'Airtel', 'Tigo', 'Halotel', 'TTCL', 'Zantel'];

    const breakdown: Record<TelecomCarrier, { totalAgents: number; wakalaCount: number; registrarCount: number; staffCount: number }> = {
      Vodacom: { totalAgents: 0, wakalaCount: 0, registrarCount: 0, staffCount: 0 },
      Airtel: { totalAgents: 0, wakalaCount: 0, registrarCount: 0, staffCount: 0 },
      Tigo: { totalAgents: 0, wakalaCount: 0, registrarCount: 0, staffCount: 0 },
      Halotel: { totalAgents: 0, wakalaCount: 0, registrarCount: 0, staffCount: 0 },
      TTCL: { totalAgents: 0, wakalaCount: 0, registrarCount: 0, staffCount: 0 },
      Zantel: { totalAgents: 0, wakalaCount: 0, registrarCount: 0, staffCount: 0 },
    };

    agents.forEach((a) => {
      if (breakdown[a.carrier]) {
        breakdown[a.carrier].totalAgents += 1;
        if (a.idType === 'WAKALA') breakdown[a.carrier].wakalaCount += 1;
        else if (a.idType === 'SIM_REGISTRAR') breakdown[a.carrier].registrarCount += 1;
        else if (a.idType === 'STAFF') breakdown[a.carrier].staffCount += 1;
      }
    });

    return {
      carriers,
      breakdown,
      totalAllAgents: agents.length,
    };
  },

  resetSeedData(): void {
    localStorage.removeItem(CITIZENS_STORAGE_KEY);
    localStorage.removeItem(TELECOM_AGENTS_STORAGE_KEY);
    localStorage.removeItem(AUDIT_LOG_KEY);
    localStorage.removeItem(CARRIER_CUSTOM_LOGOS_KEY);
    localStorage.removeItem(CITIZEN_DEFAULT_LOGO_KEY);
    this.getCitizens();
    this.getTelecomAgents();
    this.getAuditLogs();
  },
};

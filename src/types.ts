export type VerificationStatus = 'VERIFIED' | 'PENDING_UPDATE' | 'RESTRICTED' | 'PROVISIONAL';

export type SearchInputMode = 'auto' | 'phone' | 'nin' | 'name';

export type TelecomCarrier = 'Vodacom' | 'Airtel' | 'Tigo' | 'Halotel' | 'TTCL' | 'Zantel';

export type TelecomIdType = 'WAKALA' | 'SIM_REGISTRAR' | 'STAFF' | 'SUBSCRIBER';

export interface TelecomAgentProfile {
  id: string;
  carrier: TelecomCarrier;
  idType: TelecomIdType;
  agentCode: string;
  tillNumber?: string;
  employeeId?: string;
  tcraLicenseNumber: string;
  branchName: string;
  operatingRegion: string;
  assignedPhone: string;
  ownerName: string;
  nin: string;
  avatarUrl?: string;
  customLogoUrl?: string;
  issueDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  securityBarcode: string;
}

export interface RegisteredSim {
  msisdn: string; // e.g. "0784615052"
  carrier: TelecomCarrier;
  biometricStatus: 'BIOMETRIC_VERIFIED' | 'PENDING_REGISTRATION';
  registrationDate: string;
  simSerial: string;
  isPrimary: boolean;
}

export interface NidaRecord {
  id: string; // Internal record ID
  nin: string; // 20-digit National ID: YYYYMMDD-XXXXX-XXXXX-XX
  fullName: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  primaryPhone: string;
  registeredSims: RegisteredSim[];
  placeOfBirth: {
    region: string;
    district: string;
    ward: string;
  };
  nationality: string;
  citizenshipType: 'CITIZEN BY BIRTH' | 'CITIZEN BY REGISTRATION' | 'CITIZEN BY NATURALIZATION';
  verificationStatus: VerificationStatus;
  statusNotes?: string;
  issueDate: string;
  expiryDate: string;
  documentNumber: string;
  fingerprintEnrolled: boolean;
  facialRecognitionMatched: boolean;
  securityChecksum: string;
  residence: {
    region: string;
    district: string;
    ward: string;
    street: string;
  };
  avatarUrl?: string;
  avatarPlaceholderColor?: string;
  customLogoUrl?: string;
}

export interface SearchQueryHistory {
  query: string;
  queryType?: 'phone' | 'nin' | 'name';
  timestamp: number;
  recordNin: string;
  recordName: string;
  recordPhone?: string;
  status: VerificationStatus;
}

export type RequestStatus = 'Pending' | 'Completed' | 'Rejected';

export type UserRole = 'user' | 'admin' | 'feeder';

export interface SystemUser {
  id: string;
  phone: string;
  password?: string;
  role: UserRole;
  credit: number; // floating balance in TSh (e.g. 240.00)
  fullName?: string;
  createdAt: number;
  isBlocked?: boolean;
  apiKey?: string; // Sinsoft live API key, e.g. sin_live_xxxxxx
  webhookUrl?: string;
  totalApiCalls?: number;
  email?: string;
  nin?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  nationality?: string;
  residence?: string;
  district?: string;
  verificationTier?: string;
  passStatus?: 'ACTIVE' | 'PENDING' | 'RENEWAL';
  avatarUrl?: string;
  lastLogin?: number;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  type: 'AUTH' | 'VERIFY' | 'SECURITY' | 'PASS_UPDATE' | 'EXPORT';
  title: string;
  description: string;
  ipAddress: string;
  device: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  timestamp: number;
}

export interface ApiLogEntry {
  id: string;
  userPhone: string;
  endpoint: string;
  query: string;
  queryType: 'nin' | 'phone' | 'name';
  statusCode: number;
  cost: number;
  timestamp: number;
  latencyMs: number;
  ipAddress?: string;
}

export interface SinsoftApiResponse {
  status: number;
  success: boolean;
  message: string;
  query: string;
  query_type: string;
  charge: number;
  remaining_balance: number;
  timestamp: string;
  execution_time_ms: number;
  data: {
    nin: string;
    nin_raw: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    full_name: string;
    gender: 'MALE' | 'FEMALE';
    date_of_birth: string;
    age: number;
    nationality: string;
    citizenship_type: string;
    phone: string;
    carrier: string;
    registered_sims: {
      msisdn: string;
      carrier: string;
      biometric_status: string;
      registration_date: string;
    }[];
    place_of_birth: {
      region: string;
      district: string;
      ward: string;
    };
    residence: {
      region: string;
      district: string;
      ward: string;
      street: string;
    };
    biometrics: {
      fingerprint_enrolled: boolean;
      facial_matched: boolean;
      status: string;
    };
    verification_status: string;
    document_number: string;
    issue_date: string;
    expiry_date: string;
    photo_url: string;
    signature_url: string;
    qr_code_url: string;
    security_checksum: string;
  } | null;
}

export interface BulkLookupItem {
  query: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  record?: NidaRecord;
  error?: string;
}

export type CreditRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CreditRequest {
  id: string;
  userPhone: string;
  userName?: string;
  amount: number;
  paymentMethod: string;
  transactionRef: string;
  notes?: string;
  status: CreditRequestStatus;
  timestamp: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface DepositRecord {
  id: string;
  userPhone: string;
  amount: number;
  timestamp: number;
  adminPhone?: string;
  reference?: string;
}

export type AuditActionType = 
  | 'USER_CREATED'
  | 'USER_DELETED'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED'
  | 'CREDIT_ADDED'
  | 'CREDIT_UPDATED'
  | 'CREDIT_REQUEST_SUBMITTED'
  | 'CREDIT_REQUEST_APPROVED'
  | 'CREDIT_REQUEST_REJECTED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_BLOCKED_ATTEMPT'
  | 'LOGIN_FAILED'
  | 'NIDA_REQUEST_FULFILLED';

export interface AuditLogEntry {
  id: string;
  action: AuditActionType;
  actorPhone: string;
  actorRole: string;
  targetPhone?: string;
  targetName?: string;
  details: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface NidaServiceRequest {
  id: string;
  userId: string;
  userPhone: string;
  targetPhone: string; // The mobile phone number needing NIDA (customer)
  applicantName?: string;
  timestamp: number;
  status: RequestStatus;
  nidaNumber?: string; // Retrieved NIDA number (assigned by admin)
  completedAt?: number;
  adminNotes?: string;
  costTokens: number;
  costTsh?: number;
}


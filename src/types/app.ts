export interface UserAccount {
  id: number;
  full_name: string;
  phone: string;
  credit_balance: number;
  status: 'active' | 'suspended';
  created_at: string;
  request_count?: number;
}

export interface AdminAccount {
  id: number;
  full_name: string;
  username: string;
  phone: string;
  role: string;
}

export interface PublicSettings {
  appName: string;
  creditRateTzs: number;
  defaultRequestCost: number;
  supportPhone: string;
  footerText: string;
  paymentGatewayReady?: boolean;
}

export interface ServiceRequirement {
  id?: number;
  service_id?: number;
  field_label: string;
  field_name: string;
  field_type: 'text' | 'textarea' | 'number' | 'phone' | 'file';
  is_required: number | boolean;
  accepted_formats?: string;
  placeholder?: string;
  sort_order?: number;
}

export type ServiceCategory = 'NIDA SERVICES' | 'DOCUMENT SERVICES' | 'TILL SERVICES';

export interface ServiceItem {
  id: number;
  category: ServiceCategory;
  name: string;
  slug: string;
  description: string;
  requirements_summary: string;
  credit_cost: number;
  is_active: number;
  sort_order: number;
  requirements: ServiceRequirement[];
}

export interface RequestDocument {
  id: number;
  field_label: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface CompletedDocument {
  id: number;
  original_filename: string;
  mime_type: string;
  file_size: number;
  result_note: string;
  uploaded_at: string;
}

export interface ServiceRequestItem {
  id: number;
  request_code: string;
  user_id?: number;
  user_name?: string;
  user_phone?: string;
  service_id: number;
  service_name: string;
  service_category: ServiceCategory;
  submitted_data: Record<string, string>;
  credits_charged: number;
  status: 'Submitted' | 'Completed' | 'Rejected';
  admin_internal_notes?: string;
  result_summary: string;
  rejection_reason: string;
  processed_at: string | null;
  created_at: string;
  documents: RequestDocument[];
  completed_documents: CompletedDocument[];
}

export interface CreditTransaction {
  id: number;
  user_id: number;
  user_name?: string;
  user_phone?: string;
  type: 'purchase' | 'deduction' | 'admin_add' | 'refund';
  credits: number;
  balance_before: number;
  balance_after: number;
  reference_code: string;
  description: string;
  created_at: string;
}

export interface PaymentRecord {
  id: number;
  order_id: string;
  user_id: number;
  user_name?: string;
  user_phone?: string;
  amount_tzs: number;
  expected_credits: number;
  payment_phone: string;
  description: string;
  status: 'Pending' | 'Success' | 'Failed';
  dsn_reference: string;
  credited: number;
  verified_at: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  event_type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface MerchantBalanceData {
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

export interface WithdrawalRecord {
  id: number;
  withdrawal_code: string;
  admin_name: string;
  amount_tzs: number;
  network: 'Airtel Money' | 'Yas Pesa' | 'M-Pesa' | 'HaloPesa';
  recipient_phone: string;
  recipient_name: string;
  status: 'Pending' | 'Processing' | 'Successful' | 'Failed';
  notes: string;
  created_at: string;
}

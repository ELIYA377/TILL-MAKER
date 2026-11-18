import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const DB_PATH = path.resolve(DATA_DIR, 'digitalsales.db');
export const UPLOAD_DIR = path.resolve(ROOT_DIR, 'private_uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.startsWith('scrypt$')) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;
  const [, salt, originalHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

export function initializeDatabase() {
  db.exec(`
    -- 1. users
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      credit_balance REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

    -- 2. admins
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'super_admin',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 3. services
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL CHECK (category IN ('NIDA SERVICES', 'DOCUMENT SERVICES', 'TILL SERVICES')),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      requirements_summary TEXT NOT NULL,
      credit_cost REAL NOT NULL DEFAULT 2,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
    CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

    -- 4. service_requirements
    CREATE TABLE IF NOT EXISTS service_requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      field_label TEXT NOT NULL,
      field_name TEXT NOT NULL,
      field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text', 'textarea', 'number', 'phone', 'file')),
      is_required INTEGER NOT NULL DEFAULT 1,
      accepted_formats TEXT DEFAULT 'PDF,JPG,JPEG,PNG',
      placeholder TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_service_req_service ON service_requirements(service_id);

    -- 5. requests
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_code TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      submitted_data_json TEXT NOT NULL,
      credits_charged REAL NOT NULL DEFAULT 2,
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Completed', 'Rejected')),
      admin_internal_notes TEXT DEFAULT '',
      result_summary TEXT DEFAULT '',
      rejection_reason TEXT DEFAULT '',
      processed_by INTEGER,
      processed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
      FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_requests_user ON requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
    CREATE INDEX IF NOT EXISTS idx_requests_code ON requests(request_code);

    -- 6. request_documents
    CREATE TABLE IF NOT EXISTS request_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      field_label TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_req_docs_request ON request_documents(request_id);

    -- 7. completed_documents
    CREATE TABLE IF NOT EXISTS completed_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      uploaded_by INTEGER NOT NULL,
      original_filename TEXT NOT NULL,
      stored_filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      result_note TEXT DEFAULT '',
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS idx_comp_docs_request ON completed_documents(request_id);

    -- 8. credit_transactions
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('purchase', 'deduction', 'admin_add', 'refund')),
      credits REAL NOT NULL,
      balance_before REAL NOT NULL,
      balance_after REAL NOT NULL,
      reference_code TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON credit_transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_credit_tx_ref ON credit_transactions(reference_code);

    -- 9. payments
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      amount_tzs REAL NOT NULL,
      expected_credits REAL NOT NULL,
      payment_phone TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Success', 'Failed')),
      dsn_reference TEXT DEFAULT '',
      credited INTEGER NOT NULL DEFAULT 0,
      verified_amount REAL,
      verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

    -- 10. payment_logs
    CREATE TABLE IF NOT EXISTS payment_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      http_method TEXT NOT NULL,
      request_payload TEXT,
      response_code INTEGER,
      response_body TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(order_id);

    -- 11. merchant_balance_logs
    CREATE TABLE IF NOT EXISTS merchant_balance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      available_balance REAL,
      pending_funds REAL,
      reserved_withdrawals REAL,
      total_collected REAL,
      total_collection_fees REAL,
      total_net_earnings REAL,
      api_status TEXT NOT NULL,
      raw_response TEXT,
      checked_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (checked_by) REFERENCES admins(id) ON DELETE SET NULL
    );

    -- 12. withdrawals
    CREATE TABLE IF NOT EXISTS withdrawals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      withdrawal_code TEXT NOT NULL UNIQUE,
      admin_id INTEGER NOT NULL,
      amount_tzs REAL NOT NULL,
      network TEXT NOT NULL CHECK (network IN ('Airtel Money', 'Yas Pesa', 'M-Pesa', 'HaloPesa')),
      recipient_phone TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Successful', 'Failed')),
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE RESTRICT
    );

    -- 13. notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      admin_target INTEGER NOT NULL DEFAULT 0,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_admin ON notifications(admin_target);

    -- 14. activity_logs
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'system')),
      actor_id INTEGER,
      actor_label TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at);

    -- 15. system_settings
    CREATE TABLE IF NOT EXISTS system_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      description TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  // Seed default system settings
  const settingsInsert = db.prepare(`
    INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description)
    VALUES (?, ?, ?)
  `);
  const defaultSettings: Array<[string, string, string]> = [
    ['app_name', 'DIGITAL SALES PRO MAX', 'Platform display title'],
    ['credit_rate_tzs', '100', 'TSh cost per 1 credit when buying credits'],
    ['default_request_cost', '2', 'Default credit deduction per service request'],
    ['dsn_user_id', 'DSN-0036', 'Official DSN Technology Merchant User ID'],
    ['support_phone', '0784615052', 'Support & Password recovery assistance phone'],
    ['footer_text', 'Developed by Digital Sales', 'Required application footer'],
    ['withdrawal_api_active', '0', 'Set to 1 only after official DSN withdrawal API integration'],
  ];
  for (const [k, v, d] of defaultSettings) {
    settingsInsert.run(k, v, d);
  }

  // One-time upgrade migration from legacy 500 TSh rate to 100 TSh = 1 Credit
  const rateMigrated = db
    .prepare("SELECT setting_value FROM system_settings WHERE setting_key = 'migrated_rate_100_v1'")
    .get();
  if (!rateMigrated) {
    db.prepare("UPDATE system_settings SET setting_value = '100', updated_at = datetime('now') WHERE setting_key = 'credit_rate_tzs'").run();
    db.prepare("INSERT OR IGNORE INTO system_settings (setting_key, setting_value, description) VALUES ('migrated_rate_100_v1', '1', 'Migrated credit rate to TSh 100 per credit')").run();
  }

  // Seed initial Admin if admins table is empty
  const adminCount = db.prepare('SELECT COUNT(*) as cnt FROM admins').get() as { cnt: number };
  if (adminCount.cnt === 0) {
    db.prepare(`
      INSERT INTO admins (full_name, username, phone, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, 'super_admin', 1)
    `).run('Digital Sales Super Admin', 'admin', '0784615052', hashPassword('Admin@2026'));
  }

  // Seed default Services if services table is empty
  const serviceCount = db.prepare('SELECT COUNT(*) as cnt FROM services').get() as { cnt: number };
  if (serviceCount.cnt === 0) {
    const servicesToSeed: Array<{
      category: 'NIDA SERVICES' | 'DOCUMENT SERVICES' | 'TILL SERVICES';
      name: string;
      slug: string;
      description: string;
      requirements_summary: string;
      credit_cost: number;
      sort_order: number;
      fields: Array<{
        label: string;
        name: string;
        type: 'text' | 'textarea' | 'number' | 'phone' | 'file';
        required: number;
        placeholder: string;
      }>;
    }> = [
      // A. NIDA SERVICES
      {
        category: 'NIDA SERVICES',
        name: 'NIDA Lookup',
        slug: 'nida-lookup',
        description: 'Authorized NIDA National Identification Number lookup processed via official verification procedures.',
        requirements_summary: 'Provide applicant full names, date of birth, and supporting identity document.',
        credit_cost: 2,
        sort_order: 1,
        fields: [
          { label: 'Applicant Full Name (Three Names)', name: 'applicant_full_name', type: 'text', required: 1, placeholder: 'e.g. Juma Hamisi Bakari' },
          { label: 'Date of Birth or NIDA Reference', name: 'dob_or_ref', type: 'text', required: 1, placeholder: 'DD/MM/YYYY or NIDA Ref' },
          { label: 'Supporting ID / Letter (PDF, JPG, PNG)', name: 'supporting_document', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'NIDA SERVICES',
        name: 'NIDA Information Request',
        slug: 'nida-information-request',
        description: 'Authorized NIDA citizen record information retrieval and official status confirmation.',
        requirements_summary: 'NIN or Ward Executive confirmation letter and applicant identification.',
        credit_cost: 2,
        sort_order: 2,
        fields: [
          { label: 'National Identification Number (NIN) / Ref', name: 'nin_number', type: 'text', required: 1, placeholder: '20-digit NIN or Application Ref' },
          { label: 'Applicant Phone Number', name: 'applicant_phone', type: 'phone', required: 1, placeholder: '07XXXXXXXX' },
          { label: 'Authorization / Request Form (PDF, JPG, PNG)', name: 'authorization_doc', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'NIDA SERVICES',
        name: 'NIDA Document Processing',
        slug: 'nida-document-processing',
        description: 'Authorized NIDA document assistance, slip preparation, and official application follow-up.',
        requirements_summary: 'Upload birth certificate or local government introduction letter and passport photo.',
        credit_cost: 2,
        sort_order: 3,
        fields: [
          { label: 'Applicant Full Name', name: 'applicant_full_name', type: 'text', required: 1, placeholder: 'Full three names' },
          { label: 'District & Ward', name: 'district_ward', type: 'text', required: 1, placeholder: 'e.g. Kinondoni, Kijitonyama' },
          { label: 'Birth Certificate / Introduction Letter', name: 'primary_doc', type: 'file', required: 1, placeholder: '' },
          { label: 'Supporting Attachment (Optional)', name: 'secondary_doc', type: 'file', required: 0, placeholder: '' },
        ],
      },
      // B. DOCUMENT SERVICES
      {
        category: 'DOCUMENT SERVICES',
        name: 'TIN Certificate',
        slug: 'tin-certificate',
        description: 'Official TRA Taxpayer Identification Number (TIN) application and certificate processing.',
        requirements_summary: 'NIDA Number, active mobile number, physical address, and NIDA ID copy.',
        credit_cost: 2,
        sort_order: 4,
        fields: [
          { label: 'Applicant Full Name', name: 'applicant_full_name', type: 'text', required: 1, placeholder: 'Three official names' },
          { label: 'NIDA Number (NIN)', name: 'nida_number', type: 'text', required: 1, placeholder: '20-digit NIDA number' },
          { label: 'Physical / Business Address', name: 'address', type: 'text', required: 1, placeholder: 'Region, District, Street' },
          { label: 'NIDA ID Copy / Slip (PDF, JPG, PNG)', name: 'nida_copy', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'DOCUMENT SERVICES',
        name: 'Business License',
        slug: 'business-license',
        description: 'Municipal/Trade Business License application processing through official licensing channels.',
        requirements_summary: 'TIN Certificate, lease agreement or ownership proof, and NIDA ID.',
        credit_cost: 2,
        sort_order: 5,
        fields: [
          { label: 'Business Name', name: 'business_name', type: 'text', required: 1, placeholder: 'Registered business name' },
          { label: 'Business Activity / Category', name: 'business_activity', type: 'text', required: 1, placeholder: 'e.g. Retail Shop, ICT Services' },
          { label: 'TIN Certificate (PDF, JPG, PNG)', name: 'tin_document', type: 'file', required: 1, placeholder: '' },
          { label: 'Lease Agreement / Premises Proof', name: 'lease_document', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'DOCUMENT SERVICES',
        name: 'Business Documents',
        slug: 'business-documents',
        description: 'Preparation and official processing of corporate filings, tax clearances, and business records.',
        requirements_summary: 'Specify document required and attach company/business identification.',
        credit_cost: 2,
        sort_order: 6,
        fields: [
          { label: 'Business / Company Name', name: 'business_name', type: 'text', required: 1, placeholder: 'Entity name' },
          { label: 'Document Details & Purpose', name: 'document_details', type: 'textarea', required: 1, placeholder: 'Describe required business document' },
          { label: 'Supporting Business File (PDF, JPG, PNG)', name: 'business_file', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'DOCUMENT SERVICES',
        name: 'Business Registration Documents',
        slug: 'business-registration-documents',
        description: 'BRELA Business Name or Company Registration certificate and extract processing.',
        requirements_summary: 'Proposed business names, proprietor NIDA numbers, and ID attachments.',
        credit_cost: 2,
        sort_order: 7,
        fields: [
          { label: 'Proposed Business Name (1st & 2nd Choice)', name: 'proposed_names', type: 'text', required: 1, placeholder: 'Primary & backup name' },
          { label: 'Owner NIDA Number', name: 'owner_nida', type: 'text', required: 1, placeholder: '20-digit NIN' },
          { label: 'Owner NIDA ID Document (PDF, JPG, PNG)', name: 'owner_id_file', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'DOCUMENT SERVICES',
        name: 'Lipa Number Documents',
        slug: 'lipa-number-documents',
        description: 'Authorized merchant documentation bundle required for mobile money Lipa Number onboarding.',
        requirements_summary: 'TIN, Business License/Local Gov letter, NIDA ID, and shop photo.',
        credit_cost: 2,
        sort_order: 8,
        fields: [
          { label: 'Merchant / Shop Name', name: 'merchant_name', type: 'text', required: 1, placeholder: 'Official shop name' },
          { label: 'Mobile Network Target', name: 'network_target', type: 'text', required: 1, placeholder: 'e.g. M-Pesa / Yas / Airtel' },
          { label: 'TIN / Business Document (PDF, JPG, PNG)', name: 'merchant_doc', type: 'file', required: 1, placeholder: '' },
          { label: 'Owner NIDA ID Copy', name: 'owner_nida_doc', type: 'file', required: 1, placeholder: '' },
        ],
      },
      // C. TILL SERVICES
      {
        category: 'TILL SERVICES',
        name: 'Airtel Money Till',
        slug: 'airtel-money-till',
        description: 'Official Airtel Money Merchant Till application processed through authorized Airtel merchant channels.',
        requirements_summary: 'Airtel SIM line, NIDA ID, TIN Certificate, and Business License.',
        credit_cost: 2,
        sort_order: 9,
        fields: [
          { label: 'Business / Merchant Name', name: 'merchant_name', type: 'text', required: 1, placeholder: 'Merchant name' },
          { label: 'Airtel Line Phone Number', name: 'airtel_phone', type: 'phone', required: 1, placeholder: '078XXXXXXX / 068XXXXXXX' },
          { label: 'Owner NIDA ID (PDF, JPG, PNG)', name: 'nida_file', type: 'file', required: 1, placeholder: '' },
          { label: 'TIN & Business License', name: 'business_docs', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'TILL SERVICES',
        name: 'Airtel Lipa Number',
        slug: 'airtel-lipa-number',
        description: 'Official Airtel Lipa Number merchant onboarding and authorized approval submission.',
        requirements_summary: 'NIDA ID, active Airtel phone number, and business verification document.',
        credit_cost: 2,
        sort_order: 10,
        fields: [
          { label: 'Shop / Enterprise Name', name: 'shop_name', type: 'text', required: 1, placeholder: 'Registered shop name' },
          { label: 'Airtel Contact Number', name: 'airtel_phone', type: 'phone', required: 1, placeholder: '078XXXXXXX' },
          { label: 'NIDA ID Document (PDF, JPG, PNG)', name: 'nida_file', type: 'file', required: 1, placeholder: '' },
          { label: 'Business Permit / TIN Certificate', name: 'permit_file', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'TILL SERVICES',
        name: 'Yas Lipa',
        slug: 'yas-lipa',
        description: 'Official Yas (Mixx by Yas) Lipa Namba merchant registration via authorized provider approval.',
        requirements_summary: 'Yas mobile number, NIDA ID, TIN or local business authorization.',
        credit_cost: 2,
        sort_order: 11,
        fields: [
          { label: 'Merchant Trading Name', name: 'trading_name', type: 'text', required: 1, placeholder: 'Trading name' },
          { label: 'Yas Phone Number', name: 'yas_phone', type: 'phone', required: 1, placeholder: '071XXXXXXX / 065XXXXXXX' },
          { label: 'Owner NIDA ID (PDF, JPG, PNG)', name: 'nida_file', type: 'file', required: 1, placeholder: '' },
          { label: 'TIN / Business Authorization', name: 'biz_doc', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'TILL SERVICES',
        name: 'Halotel Till',
        slug: 'halotel-till',
        description: 'Authorized Halotel Merchant Till onboarding and official provider submission.',
        requirements_summary: 'Halotel registered number, NIDA ID, and business license/TIN.',
        credit_cost: 2,
        sort_order: 12,
        fields: [
          { label: 'Business Name', name: 'business_name', type: 'text', required: 1, placeholder: 'Business name' },
          { label: 'Halotel Phone Number', name: 'halotel_phone', type: 'phone', required: 1, placeholder: '062XXXXXXX' },
          { label: 'NIDA ID Copy (PDF, JPG, PNG)', name: 'nida_file', type: 'file', required: 1, placeholder: '' },
          { label: 'Business Registration / TIN', name: 'reg_file', type: 'file', required: 1, placeholder: '' },
        ],
      },
      {
        category: 'TILL SERVICES',
        name: 'HaloPesa Till',
        slug: 'halopesa-till',
        description: 'Official HaloPesa Merchant Till application processed with authorized HaloPesa approval.',
        requirements_summary: 'Active HaloPesa line, NIDA ID, TIN Certificate, and shop details.',
        credit_cost: 2,
        sort_order: 13,
        fields: [
          { label: 'Merchant Business Name', name: 'merchant_name', type: 'text', required: 1, placeholder: 'Business name' },
          { label: 'HaloPesa Mobile Number', name: 'halopesa_phone', type: 'phone', required: 1, placeholder: '062XXXXXXX' },
          { label: 'NIDA ID Document (PDF, JPG, PNG)', name: 'nida_file', type: 'file', required: 1, placeholder: '' },
          { label: 'TIN / Business License', name: 'license_file', type: 'file', required: 1, placeholder: '' },
        ],
      },
    ];

    const insertSvc = db.prepare(`
      INSERT INTO services (category, name, slug, description, requirements_summary, credit_cost, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `);
    const insertReq = db.prepare(`
      INSERT INTO service_requirements (service_id, field_label, field_name, field_type, is_required, accepted_formats, placeholder, sort_order)
      VALUES (?, ?, ?, ?, ?, 'PDF,JPG,JPEG,PNG', ?, ?)
    `);

    const seedTx = db.transaction(() => {
      for (const s of servicesToSeed) {
        const res = insertSvc.run(s.category, s.name, s.slug, s.description, s.requirements_summary, s.credit_cost, s.sort_order);
        const serviceId = Number(res.lastInsertRowid);
        s.fields.forEach((f, idx) => {
          insertReq.run(serviceId, f.label, f.name, f.type, f.required, f.placeholder, idx + 1);
        });
      }
    });
    seedTx();
  }
}

export function getSetting(key: string, fallback = ''): string {
  const row = db.prepare('SELECT setting_value FROM system_settings WHERE setting_key = ?').get(key) as { setting_value: string } | undefined;
  return row ? row.setting_value : fallback;
}

export function logActivity(
  actorType: 'user' | 'admin' | 'system',
  actorId: number | null,
  actorLabel: string,
  action: string,
  details: string,
  ipAddress = ''
) {
  db.prepare(`
    INSERT INTO activity_logs (actor_type, actor_id, actor_label, action, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(actorType, actorId, actorLabel, action, details, ipAddress);
}

export function createNotification(
  userId: number | null,
  adminTarget: number,
  eventType: string,
  title: string,
  message: string
) {
  db.prepare(`
    INSERT INTO notifications (user_id, admin_target, event_type, title, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, adminTarget, eventType, title, message);
}

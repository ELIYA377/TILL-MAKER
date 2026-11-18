-- DIGITAL SALES PRO MAX - Complete MySQL 8+ / MariaDB Schema (15 Tables)
-- Target Hosting: InfinityFree / Standard MySQL InnoDB

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. users
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(180) NOT NULL,
  `phone` VARCHAR(24) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `credit_balance` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. admins
CREATE TABLE IF NOT EXISTS `admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(180) NOT NULL,
  `username` VARCHAR(80) NOT NULL,
  `phone` VARCHAR(24) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_username` (`username`),
  UNIQUE KEY `uq_admins_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. services
CREATE TABLE IF NOT EXISTS `services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category` ENUM('NIDA SERVICES', 'DOCUMENT SERVICES', 'TILL SERVICES') NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `slug` VARCHAR(180) NOT NULL,
  `description` TEXT NOT NULL,
  `requirements_summary` TEXT NOT NULL,
  `credit_cost` DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_services_slug` (`slug`),
  KEY `idx_services_category` (`category`),
  KEY `idx_services_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. service_requirements
CREATE TABLE IF NOT EXISTS `service_requirements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `field_label` VARCHAR(180) NOT NULL,
  `field_name` VARCHAR(120) NOT NULL,
  `field_type` ENUM('text', 'textarea', 'number', 'phone', 'file') NOT NULL DEFAULT 'text',
  `is_required` TINYINT(1) NOT NULL DEFAULT 1,
  `accepted_formats` VARCHAR(100) NOT NULL DEFAULT 'PDF,JPG,JPEG,PNG',
  `placeholder` VARCHAR(180) NOT NULL DEFAULT '',
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_req_service` (`service_id`),
  CONSTRAINT `fk_srv_req_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. requests
CREATE TABLE IF NOT EXISTS `requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_code` VARCHAR(40) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `submitted_data_json` LONGTEXT NOT NULL,
  `credits_charged` DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  `status` ENUM('Submitted', 'Completed', 'Rejected') NOT NULL DEFAULT 'Submitted',
  `admin_internal_notes` TEXT NULL,
  `result_summary` TEXT NULL,
  `rejection_reason` TEXT NULL,
  `processed_by` BIGINT UNSIGNED NULL,
  `processed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_requests_code` (`request_code`),
  KEY `idx_requests_user` (`user_id`),
  KEY `idx_requests_service` (`service_id`),
  KEY `idx_requests_status` (`status`),
  CONSTRAINT `fk_requests_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requests_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_requests_admin` FOREIGN KEY (`processed_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. request_documents
CREATE TABLE IF NOT EXISTS `request_documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` BIGINT UNSIGNED NOT NULL,
  `field_label` VARCHAR(180) NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(120) NOT NULL,
  `file_size` BIGINT UNSIGNED NOT NULL,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_req_docs_req` (`request_id`),
  CONSTRAINT `fk_req_docs_request` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. completed_documents
CREATE TABLE IF NOT EXISTS `completed_documents` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` BIGINT UNSIGNED NOT NULL,
  `uploaded_by` BIGINT UNSIGNED NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `stored_filename` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(120) NOT NULL,
  `file_size` BIGINT UNSIGNED NOT NULL,
  `result_note` TEXT NULL,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comp_docs_req` (`request_id`),
  CONSTRAINT `fk_comp_docs_request` FOREIGN KEY (`request_id`) REFERENCES `requests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comp_docs_admin` FOREIGN KEY (`uploaded_by`) REFERENCES `admins` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. credit_transactions
CREATE TABLE IF NOT EXISTS `credit_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('purchase', 'deduction', 'admin_add', 'refund') NOT NULL,
  `credits` DECIMAL(12,2) NOT NULL,
  `balance_before` DECIMAL(12,2) NOT NULL,
  `balance_after` DECIMAL(12,2) NOT NULL,
  `reference_code` VARCHAR(80) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_credit_tx_user` (`user_id`),
  KEY `idx_credit_tx_ref` (`reference_code`),
  CONSTRAINT `fk_credit_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(80) NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `amount_tzs` DECIMAL(14,2) NOT NULL,
  `expected_credits` DECIMAL(12,2) NOT NULL,
  `payment_phone` VARCHAR(24) NOT NULL,
  `customer_name` VARCHAR(180) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `status` ENUM('Pending', 'Success', 'Failed') NOT NULL DEFAULT 'Pending',
  `dsn_reference` VARCHAR(120) NOT NULL DEFAULT '',
  `credited` TINYINT(1) NOT NULL DEFAULT 0,
  `verified_amount` DECIMAL(14,2) NULL DEFAULT NULL,
  `verified_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payments_order` (`order_id`),
  KEY `idx_payments_user` (`user_id`),
  KEY `idx_payments_status` (`status`),
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. payment_logs
CREATE TABLE IF NOT EXISTS `payment_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(80) NOT NULL,
  `endpoint` VARCHAR(255) NOT NULL,
  `http_method` VARCHAR(10) NOT NULL,
  `request_payload` LONGTEXT NULL,
  `response_code` INT NOT NULL DEFAULT 0,
  `response_body` LONGTEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pay_logs_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. merchant_balance_logs
CREATE TABLE IF NOT EXISTS `merchant_balance_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `available_balance` DECIMAL(14,2) NULL DEFAULT NULL,
  `pending_funds` DECIMAL(14,2) NULL DEFAULT NULL,
  `reserved_withdrawals` DECIMAL(14,2) NULL DEFAULT NULL,
  `total_collected` DECIMAL(14,2) NULL DEFAULT NULL,
  `total_collection_fees` DECIMAL(14,2) NULL DEFAULT NULL,
  `total_net_earnings` DECIMAL(14,2) NULL DEFAULT NULL,
  `api_status` VARCHAR(40) NOT NULL,
  `raw_response` LONGTEXT NULL,
  `checked_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_mbal_admin` FOREIGN KEY (`checked_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. withdrawals
CREATE TABLE IF NOT EXISTS `withdrawals` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `withdrawal_code` VARCHAR(60) NOT NULL,
  `admin_id` BIGINT UNSIGNED NOT NULL,
  `amount_tzs` DECIMAL(14,2) NOT NULL,
  `network` ENUM('Airtel Money', 'Yas Pesa', 'M-Pesa', 'HaloPesa') NOT NULL,
  `recipient_phone` VARCHAR(24) NOT NULL,
  `recipient_name` VARCHAR(180) NOT NULL,
  `status` ENUM('Pending', 'Processing', 'Successful', 'Failed') NOT NULL DEFAULT 'Pending',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_withdrawals_code` (`withdrawal_code`),
  CONSTRAINT `fk_withdrawals_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `admin_target` TINYINT(1) NOT NULL DEFAULT 0,
  `event_type` VARCHAR(60) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_admin` (`admin_target`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. activity_logs
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_type` ENUM('user', 'admin', 'system') NOT NULL,
  `actor_id` BIGINT UNSIGNED NULL,
  `actor_label` VARCHAR(180) NOT NULL,
  `action` VARCHAR(80) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(64) NOT NULL DEFAULT '',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. system_settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_key` VARCHAR(80) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `description` VARCHAR(255) NOT NULL DEFAULT '',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default system settings
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES
('app_name', 'DIGITAL SALES PRO MAX', 'Platform display title'),
('credit_rate_tzs', '100', 'TSh cost per 1 credit when buying credits'),
('default_request_cost', '2', 'Default credit cost per service request'),
('dsn_user_id', 'DSN-0036', 'Official DSN Technology Merchant User ID'),
('support_phone', '0784615052', 'Support helpline'),
('footer_text', 'Developed by Digital Sales', 'Required footer text'),
('withdrawal_api_active', '0', 'Set to 1 only after official DSN withdrawal API integration');

-- Seed 13 Official Services
INSERT IGNORE INTO `services` (`id`, `category`, `name`, `slug`, `description`, `requirements_summary`, `credit_cost`, `is_active`, `sort_order`) VALUES
(1, 'NIDA SERVICES', 'NIDA Lookup', 'nida-lookup', 'Authorized NIDA National Identification Number lookup processed via official verification procedures.', 'Applicant full three names, date of birth or ref, and supporting ID.', 2.00, 1, 1),
(2, 'NIDA SERVICES', 'NIDA Information Request', 'nida-information-request', 'Authorized NIDA citizen record information retrieval and official status confirmation.', 'NIN or reference and authorization letter.', 2.00, 1, 2),
(3, 'NIDA SERVICES', 'NIDA Document Processing', 'nida-document-processing', 'Authorized NIDA document assistance, slip preparation, and official application follow-up.', 'Birth certificate or ward introduction letter.', 2.00, 1, 3),
(4, 'DOCUMENT SERVICES', 'TIN Certificate', 'tin-certificate', 'Official TRA Taxpayer Identification Number (TIN) application and certificate processing.', 'NIDA Number, physical address, and NIDA ID copy.', 2.00, 1, 4),
(5, 'DOCUMENT SERVICES', 'Business License', 'business-license', 'Municipal/Trade Business License application processing through official licensing channels.', 'TIN Certificate and lease/premises proof.', 2.00, 1, 5),
(6, 'DOCUMENT SERVICES', 'Business Documents', 'business-documents', 'Preparation and official processing of corporate filings and business records.', 'Business details and supporting file.', 2.00, 1, 6),
(7, 'DOCUMENT SERVICES', 'Business Registration Documents', 'business-registration-documents', 'BRELA Business Name or Company Registration certificate and extract processing.', 'Proposed business names and owner NIDA ID.', 2.00, 1, 7),
(8, 'DOCUMENT SERVICES', 'Lipa Number Documents', 'lipa-number-documents', 'Authorized merchant documentation bundle required for mobile money Lipa Number onboarding.', 'TIN, Business permit, and NIDA ID copy.', 2.00, 1, 8),
(9, 'TILL SERVICES', 'Airtel Money Till', 'airtel-money-till', 'Official Airtel Money Merchant Till application processed through authorized Airtel merchant channels.', 'Airtel line, NIDA ID, TIN, and Business License.', 2.00, 1, 9),
(10, 'TILL SERVICES', 'Airtel Lipa Number', 'airtel-lipa-number', 'Official Airtel Lipa Number merchant onboarding and authorized approval submission.', 'Airtel contact number, NIDA ID, and permit.', 2.00, 1, 10),
(11, 'TILL SERVICES', 'Yas Lipa', 'yas-lipa', 'Official Yas Lipa Namba merchant registration via authorized provider approval.', 'Yas phone number, NIDA ID, and TIN/business proof.', 2.00, 1, 11),
(12, 'TILL SERVICES', 'Halotel Till', 'halotel-till', 'Authorized Halotel Merchant Till onboarding and official provider submission.', 'Halotel number, NIDA ID, and TIN/registration.', 2.00, 1, 12),
(13, 'TILL SERVICES', 'HaloPesa Till', 'halopesa-till', 'Official HaloPesa Merchant Till application processed with authorized HaloPesa approval.', 'HaloPesa number, NIDA ID, and TIN/Business License.', 2.00, 1, 13);

INSERT IGNORE INTO `service_requirements` (`service_id`, `field_label`, `field_name`, `field_type`, `is_required`, `placeholder`, `sort_order`) VALUES
(1, 'Applicant Full Name (Three Names)', 'applicant_full_name', 'text', 1, 'First Middle Last Name', 1),
(1, 'Date of Birth or NIDA Ref', 'dob_or_ref', 'text', 1, 'DD/MM/YYYY or Ref', 2),
(1, 'Supporting ID / Letter (PDF, JPG, PNG)', 'supporting_document', 'file', 1, '', 3),
(2, 'NIN or Application Reference', 'nin_number', 'text', 1, '20-digit NIN or Ref', 1),
(2, 'Applicant Phone Number', 'applicant_phone', 'phone', 1, '07XXXXXXXX', 2),
(2, 'Authorization Form (PDF, JPG, PNG)', 'authorization_doc', 'file', 1, '', 3),
(3, 'Applicant Full Name', 'applicant_full_name', 'text', 1, 'Three official names', 1),
(3, 'District & Ward', 'district_ward', 'text', 1, 'District, Ward', 2),
(3, 'Birth Certificate / Introduction Letter', 'primary_doc', 'file', 1, '', 3),
(4, 'Applicant Full Name', 'applicant_full_name', 'text', 1, 'Three official names', 1),
(4, 'NIDA Number (NIN)', 'nida_number', 'text', 1, '20-digit NIN', 2),
(4, 'Physical / Business Address', 'address', 'text', 1, 'Region, District, Street', 3),
(4, 'NIDA ID Copy / Slip (PDF, JPG, PNG)', 'nida_copy', 'file', 1, '', 4),
(5, 'Business Name', 'business_name', 'text', 1, 'Registered business name', 1),
(5, 'Business Activity', 'business_activity', 'text', 1, 'e.g. Retail Shop', 2),
(5, 'TIN Certificate (PDF, JPG, PNG)', 'tin_document', 'file', 1, '', 3),
(5, 'Lease Agreement / Premises Proof', 'lease_document', 'file', 1, '', 4),
(6, 'Business / Company Name', 'business_name', 'text', 1, 'Entity name', 1),
(6, 'Document Details & Purpose', 'document_details', 'textarea', 1, 'Describe required document', 2),
(6, 'Supporting Business File', 'business_file', 'file', 1, '', 3),
(7, 'Proposed Business Names', 'proposed_names', 'text', 1, '1st and 2nd choice', 1),
(7, 'Owner NIDA Number', 'owner_nida', 'text', 1, '20-digit NIN', 2),
(7, 'Owner NIDA ID Document', 'owner_id_file', 'file', 1, '', 3),
(8, 'Merchant / Shop Name', 'merchant_name', 'text', 1, 'Official shop name', 1),
(8, 'Target Network', 'network_target', 'text', 1, 'M-Pesa / Yas / Airtel', 2),
(8, 'TIN / Business Document', 'merchant_doc', 'file', 1, '', 3),
(8, 'Owner NIDA ID Copy', 'owner_nida_doc', 'file', 1, '', 4),
(9, 'Business / Merchant Name', 'merchant_name', 'text', 1, 'Merchant name', 1),
(9, 'Airtel Line Phone Number', 'airtel_phone', 'phone', 1, '078XXXXXXX', 2),
(9, 'Owner NIDA ID', 'nida_file', 'file', 1, '', 3),
(9, 'TIN & Business License', 'business_docs', 'file', 1, '', 4),
(10, 'Shop / Enterprise Name', 'shop_name', 'text', 1, 'Shop name', 1),
(10, 'Airtel Contact Number', 'airtel_phone', 'phone', 1, '078XXXXXXX', 2),
(10, 'NIDA ID Document', 'nida_file', 'file', 1, '', 3),
(10, 'Business Permit / TIN', 'permit_file', 'file', 1, '', 4),
(11, 'Merchant Trading Name', 'trading_name', 'text', 1, 'Trading name', 1),
(11, 'Yas Phone Number', 'yas_phone', 'phone', 1, '071XXXXXXX', 2),
(11, 'Owner NIDA ID', 'nida_file', 'file', 1, '', 3),
(11, 'TIN / Business Authorization', 'biz_doc', 'file', 1, '', 4),
(12, 'Business Name', 'business_name', 'text', 1, 'Business name', 1),
(12, 'Halotel Phone Number', 'halotel_phone', 'phone', 1, '062XXXXXXX', 2),
(12, 'NIDA ID Copy', 'nida_file', 'file', 1, '', 3),
(12, 'Business Registration / TIN', 'reg_file', 'file', 1, '', 4),
(13, 'Merchant Business Name', 'merchant_name', 'text', 1, 'Business name', 1),
(13, 'HaloPesa Mobile Number', 'halopesa_phone', 'phone', 1, '062XXXXXXX', 2),
(13, 'NIDA ID Document', 'nida_file', 'file', 1, '', 3),
(13, 'TIN / Business License', 'license_file', 'file', 1, '', 4);

SET FOREIGN_KEY_CHECKS = 1;

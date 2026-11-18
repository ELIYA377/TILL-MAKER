import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  db,
  initializeDatabase,
  hashPassword,
  verifyPassword,
  getSetting,
  logActivity,
  createNotification,
  UPLOAD_DIR,
} from './server/db.js';
import {
  USER_COOKIE_NAME,
  ADMIN_COOKIE_NAME,
  getCookieOptions,
  signToken,
  normalizePhone,
  getPhoneCandidates,
  isValidPhone,
  validateThreeNames,
  getClientIp,
  issueCsrfToken,
  verifyCsrf,
  getAuthedUser,
  getAuthedAdmin,
  requireUser,
  requireAdmin,
  secureUpload,
} from './server/security.js';
import {
  dsnCollectPayment,
  dsnCheckStatus,
  dsnFetchMerchantBalance,
  DsnStatusResult,
} from './server/dsnService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

initializeDatabase();

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());

  // Issue CSRF token cookie on GET /api/csrf-token
  app.get('/api/csrf-token', (req, res) => {
    const token = issueCsrfToken(req, res);
    res.json({ success: true, csrfToken: token });
  });

  // Server-to-server DSN Technology payment webhook (always verified against DSN /status before crediting)
  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const body = req.body || {};
      const orderId = String(
        body.order_id || body.orderId || body.order_reference || body.data?.order_id || ''
      ).trim();

      if (!orderId) {
        res.status(200).json({ success: true, ignored: true, message: 'No order_id provided.' });
        return;
      }

      const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId) as any;
      if (!payment) {
        res.status(200).json({ success: true, ignored: true, message: 'Order not registered locally.' });
        return;
      }

      if (payment.status === 'Success' && payment.credited === 1) {
        res.status(200).json({ success: true, alreadyCredited: true });
        return;
      }

      const dsnStatus = await dsnCheckStatus(orderId, orderId);
      if (dsnStatus.ok) {
        applyDsnStatusUpdate(payment.id, dsnStatus, getClientIp(req), 'webhook');
      }
      res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('DSN webhook error:', err);
      res.status(200).json({ success: true });
    }
  });

  // Enforce CSRF on all mutating /api/* routes
  app.use('/api', verifyCsrf);

  // Public settings
  app.get('/api/public/settings', (_req, res) => {
    res.json({
      success: true,
      appName: getSetting('app_name', 'DIGITAL SALES PRO MAX'),
      creditRateTzs: Number(getSetting('credit_rate_tzs', '100')),
      defaultRequestCost: Number(getSetting('default_request_cost', '2')),
      supportPhone: getSetting('support_phone', '0784615052'),
      footerText: getSetting('footer_text', 'Developed by Digital Sales'),
      paymentGatewayReady: Boolean((process.env.DSN_API_KEY || '').trim()),
    });
  });

  // ==================== USER AUTHENTICATION ====================

  app.post('/api/auth/register', (req, res) => {
    const { fullName, phone, password } = req.body || {};
    const cleanName = String(fullName || '').trim().replace(/\s+/g, ' ');
    const cleanPhone = normalizePhone(String(phone || ''));
    const rawPassword = String(password || '');

    if (!validateThreeNames(cleanName)) {
      res.status(400).json({
        success: false,
        message: 'Please enter your full three names (First, Middle, and Last name).',
      });
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid mobile phone number (e.g. 07XXXXXXXX or 06XXXXXXXX).',
      });
      return;
    }

    if (rawPassword.length < 4) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 4 characters or digits.',
      });
      return;
    }

    const phoneCandidates = getPhoneCandidates(String(phone || ''));
    const placeholders = phoneCandidates.map(() => '?').join(',');
    const existing = phoneCandidates.length
      ? db.prepare(`SELECT id FROM users WHERE phone IN (${placeholders})`).get(...phoneCandidates)
      : null;
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'This phone number is already registered. Please log in instead.',
      });
      return;
    }

    const passwordHash = hashPassword(rawPassword);
    const info = db.prepare(`
      INSERT INTO users (full_name, phone, password_hash, credit_balance, status)
      VALUES (?, ?, ?, 0, 'active')
    `).run(cleanName, cleanPhone, passwordHash);

    const userId = Number(info.lastInsertRowid);
    const user = db.prepare('SELECT id, full_name, phone, credit_balance, status, created_at FROM users WHERE id = ?').get(userId);

    createNotification(
      userId,
      0,
      'registration',
      'Welcome to DIGITAL SALES PRO MAX',
      `Your account for ${cleanName} (${cleanPhone}) has been registered successfully.`
    );
    createNotification(
      null,
      1,
      'new_user',
      'New User Registered',
      `${cleanName} (${cleanPhone}) registered a new user account.`
    );
    logActivity('user', userId, `${cleanName} (${cleanPhone})`, 'USER_REGISTER', 'Independent user registration completed', getClientIp(req));

    const token = signToken({ id: userId, type: 'user', exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    res.cookie(USER_COOKIE_NAME, token, getCookieOptions(req, true, 7 * 24 * 60 * 60 * 1000));

    res.status(201).json({ success: true, message: 'Registration successful.', user, token });
  });

  app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body || {};
    const cleanPhone = normalizePhone(String(phone || ''));
    const phoneCandidates = getPhoneCandidates(String(phone || ''));
    const rawPassword = String(password || '');

    if (!cleanPhone || !rawPassword) {
      res.status(400).json({ success: false, message: 'Phone number and password are required.' });
      return;
    }

    const placeholders = phoneCandidates.map(() => '?').join(',');
    const userRow = (phoneCandidates.length
      ? db.prepare(`SELECT * FROM users WHERE phone IN (${placeholders})`).get(...phoneCandidates)
      : null) as any;
    if (!userRow || !verifyPassword(rawPassword, userRow.password_hash)) {
      logActivity('user', null, cleanPhone || 'unknown', 'USER_LOGIN_FAILED', 'Invalid phone number or password attempt', getClientIp(req));
      res.status(401).json({ success: false, message: 'Invalid phone number or password. / Namba ya simu au nenosiri si sahihi.' });
      return;
    }

    if (userRow.status !== 'active') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support for assistance.',
      });
      return;
    }

    const token = signToken({ id: userRow.id, type: 'user', exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    res.cookie(USER_COOKIE_NAME, token, getCookieOptions(req, true, 7 * 24 * 60 * 60 * 1000));

    logActivity('user', userRow.id, `${userRow.full_name} (${userRow.phone})`, 'USER_LOGIN', 'User logged in', getClientIp(req));

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: userRow.id,
        full_name: userRow.full_name,
        phone: userRow.phone,
        credit_balance: userRow.credit_balance,
        status: userRow.status,
        created_at: userRow.created_at,
      },
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const user = getAuthedUser(req);
    if (user) {
      logActivity('user', user.id, `${user.full_name} (${user.phone})`, 'USER_LOGOUT', 'User logged out', getClientIp(req));
    }
    res.clearCookie(USER_COOKIE_NAME, getCookieOptions(req, true, 0));
    res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { phone } = req.body || {};
    const cleanPhone = normalizePhone(String(phone || ''));
    if (!isValidPhone(cleanPhone)) {
      res.status(400).json({ success: false, message: 'Please enter a valid registered phone number.' });
      return;
    }
    const phoneCandidates = getPhoneCandidates(String(phone || ''));
    const placeholders = phoneCandidates.map(() => '?').join(',');
    const user = (phoneCandidates.length
      ? db.prepare(`SELECT id, full_name, phone FROM users WHERE phone IN (${placeholders})`).get(...phoneCandidates)
      : null) as any;
    const supportPhone = getSetting('support_phone', '0784615052');
    if (user) {
      createNotification(
        null,
        1,
        'password_reset_request',
        'Password Reset Request',
        `User ${user.full_name} (${user.phone}) requested password reset assistance.`
      );
      logActivity('user', user.id, `${user.full_name} (${user.phone})`, 'PASSWORD_RESET_REQUEST', 'Submitted forgot-password request', getClientIp(req));
    }
    res.json({
      success: true,
      message: `If ${cleanPhone} is registered, your password reset request has been logged for verification. Contact support at ${supportPhone} to complete verification.`,
      supportPhone,
    });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = getAuthedUser(req);
    if (!user) {
      res.json({ success: true, authenticated: false, user: null });
      return;
    }
    res.json({ success: true, authenticated: true, user });
  });

  app.post('/api/auth/change-password', requireUser, (req, res) => {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || String(newPassword || '').length < 4) {
      res.status(400).json({ success: false, message: 'Current password and new password (min 4 characters) are required.' });
      return;
    }

    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as { password_hash: string };
    if (!verifyPassword(String(currentPassword), row.password_hash)) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(
      hashPassword(String(newPassword)),
      user.id
    );
    logActivity('user', user.id, `${user.full_name} (${user.phone})`, 'PASSWORD_CHANGED', 'User changed account password', getClientIp(req));
    res.json({ success: true, message: 'Password updated successfully.' });
  });

  // ==================== SERVICES CATALOG ====================

  app.get('/api/services', (_req, res) => {
    const services = db.prepare(`
      SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC
    `).all() as any[];

    const reqStmt = db.prepare('SELECT * FROM service_requirements WHERE service_id = ? ORDER BY sort_order ASC, id ASC');
    const enriched = services.map((s) => ({
      ...s,
      requirements: reqStmt.all(s.id),
    }));

    res.json({ success: true, services: enriched });
  });

  // ==================== USER REQUESTS (10-STEP WORKFLOW) ====================

  app.get('/api/requests', requireUser, (req, res) => {
    const user = (req as any).user;
    const rows = db.prepare(`
      SELECT r.id, r.request_code, r.service_id, s.name as service_name, s.category as service_category,
             r.submitted_data_json, r.credits_charged, r.status, r.result_summary, r.rejection_reason,
             r.processed_at, r.created_at, r.updated_at
      FROM requests r
      JOIN services s ON s.id = r.service_id
      WHERE r.user_id = ?
      ORDER BY r.id DESC
    `).all(user.id) as any[];

    const docStmt = db.prepare('SELECT id, field_label, original_filename, mime_type, file_size, uploaded_at FROM request_documents WHERE request_id = ?');
    const compStmt = db.prepare('SELECT id, original_filename, mime_type, file_size, result_note, uploaded_at FROM completed_documents WHERE request_id = ?');

    const requests = rows.map((r) => ({
      ...r,
      submitted_data: JSON.parse(r.submitted_data_json || '{}'),
      documents: docStmt.all(r.id),
      completed_documents: r.status === 'Completed' ? compStmt.all(r.id) : [],
    }));

    res.json({ success: true, requests });
  });

  app.post('/api/requests', requireUser, (req, res) => {
    secureUpload.any()(req, res, (uploadErr: any) => {
      if (uploadErr) {
        res.status(400).json({ success: false, message: uploadErr.message || 'File upload failed.' });
        return;
      }

      const user = (req as any).user;
      const serviceId = Number(req.body?.serviceId);
      let formFields: Record<string, string> = {};
      try {
        formFields = JSON.parse(req.body?.fields || '{}');
      } catch {
        formFields = {};
      }

      const files = ((req as any).files || []) as Express.Multer.File[];
      const cleanupFiles = () => {
        for (const f of files) {
          try { fs.unlinkSync(f.path); } catch { /* ignore */ }
        }
      };

      const service = db.prepare('SELECT * FROM services WHERE id = ? AND is_active = 1').get(serviceId) as any;
      if (!service) {
        cleanupFiles();
        res.status(404).json({ success: false, message: 'Selected service is unavailable.' });
        return;
      }

      const requirements = db.prepare('SELECT * FROM service_requirements WHERE service_id = ? ORDER BY sort_order ASC').all(serviceId) as any[];

      // Validate required fields & documents
      for (const reqField of requirements) {
        if (reqField.is_required) {
          if (reqField.field_type === 'file') {
            const hasFile = files.some((f) => f.fieldname === reqField.field_name);
            if (!hasFile) {
              cleanupFiles();
              res.status(400).json({ success: false, message: `Missing required document: ${reqField.field_label}` });
              return;
            }
          } else {
            const val = String(formFields[reqField.field_name] || '').trim();
            if (!val) {
              cleanupFiles();
              res.status(400).json({ success: false, message: `Missing required field: ${reqField.field_label}` });
              return;
            }
          }
        }
      }

      const creditCost = Number(service.credit_cost || 2);
      const requestCode = `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      try {
        const result = db.transaction(() => {
          const freshUser = db.prepare('SELECT id, credit_balance, status FROM users WHERE id = ?').get(user.id) as any;
          if (!freshUser || freshUser.status !== 'active') {
            throw new Error('ACCOUNT_UNAVAILABLE');
          }
          if (freshUser.credit_balance < creditCost) {
            throw new Error('INSUFFICIENT_CREDITS');
          }

          const newBalance = Number((freshUser.credit_balance - creditCost).toFixed(2));
          db.prepare("UPDATE users SET credit_balance = ?, updated_at = datetime('now') WHERE id = ?").run(newBalance, user.id);

          const reqInsert = db.prepare(`
            INSERT INTO requests (request_code, user_id, service_id, submitted_data_json, credits_charged, status)
            VALUES (?, ?, ?, ?, ?, 'Submitted')
          `).run(requestCode, user.id, service.id, JSON.stringify(formFields), creditCost);

          const requestId = Number(reqInsert.lastInsertRowid);

          const docInsert = db.prepare(`
            INSERT INTO request_documents (request_id, field_label, original_filename, stored_filename, mime_type, file_size)
            VALUES (?, ?, ?, ?, ?, ?)
          `);

          for (const file of files) {
            const matchedReq = requirements.find((r) => r.field_name === file.fieldname);
            docInsert.run(
              requestId,
              matchedReq ? matchedReq.field_label : file.fieldname,
              file.originalname,
              file.filename,
              file.mimetype,
              file.size
            );
          }

          db.prepare(`
            INSERT INTO credit_transactions (user_id, type, credits, balance_before, balance_after, reference_code, description)
            VALUES (?, 'deduction', ?, ?, ?, ?, ?)
          `).run(
            user.id,
            -creditCost,
            freshUser.credit_balance,
            newBalance,
            requestCode,
            `Service request deduction for ${service.name} (${requestCode})`
          );

          createNotification(
            user.id,
            0,
            'request_submitted',
            'Request Submitted',
            `Your request ${requestCode} for ${service.name} has been submitted. ${creditCost} credits deducted.`
          );
          createNotification(
            null,
            1,
            'new_request',
            'New Service Request',
            `${user.full_name} submitted ${service.name} (${requestCode}).`
          );
          logActivity('user', user.id, `${user.full_name} (${user.phone})`, 'REQUEST_SUBMITTED', `Submitted ${requestCode} for ${service.name} (-${creditCost} credits)`, getClientIp(req));

          return { requestId, requestCode, newBalance };
        })();

        res.status(201).json({
          success: true,
          message: `Request ${result.requestCode} submitted successfully! ${creditCost} credits deducted.`,
          requestCode: result.requestCode,
          creditBalance: result.newBalance,
        });
      } catch (err: any) {
        cleanupFiles();
        if (err.message === 'INSUFFICIENT_CREDITS') {
          res.status(402).json({
            success: false,
            message: `Insufficient credits. You need ${creditCost} credits to submit this request. Please buy credits first.`,
          });
          return;
        }
        res.status(500).json({ success: false, message: 'Failed to submit service request.' });
      }
    });
  });

  // ==================== SECURE AUTHORIZED FILE DOWNLOADS ====================

  app.get('/api/files/request/:docId', (req, res) => {
    const user = getAuthedUser(req);
    const admin = getAuthedAdmin(req);
    if (!user && !admin) {
      res.status(401).json({ success: false, message: 'Unauthorized file access.' });
      return;
    }

    const doc = db.prepare(`
      SELECT d.*, r.user_id
      FROM request_documents d
      JOIN requests r ON r.id = d.request_id
      WHERE d.id = ?
    `).get(Number(req.params.docId)) as any;

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found.' });
      return;
    }
    if (!admin && doc.user_id !== user?.id) {
      res.status(403).json({ success: false, message: 'Access denied to this document.' });
      return;
    }

    const filePath = path.resolve(UPLOAD_DIR, path.basename(doc.stored_filename));
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Stored file missing on server.' });
      return;
    }
    res.download(filePath, doc.original_filename);
  });

  app.get('/api/files/completed/:docId', (req, res) => {
    const user = getAuthedUser(req);
    const admin = getAuthedAdmin(req);
    if (!user && !admin) {
      res.status(401).json({ success: false, message: 'Unauthorized file access.' });
      return;
    }

    const doc = db.prepare(`
      SELECT c.*, r.user_id, r.status
      FROM completed_documents c
      JOIN requests r ON r.id = c.request_id
      WHERE c.id = ?
    `).get(Number(req.params.docId)) as any;

    if (!doc) {
      res.status(404).json({ success: false, message: 'Completed document not found.' });
      return;
    }
    if (!admin && (doc.user_id !== user?.id || doc.status !== 'Completed')) {
      res.status(403).json({ success: false, message: 'Access denied to this document.' });
      return;
    }

    const filePath = path.resolve(UPLOAD_DIR, path.basename(doc.stored_filename));
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Stored file missing on server.' });
      return;
    }
    res.download(filePath, doc.original_filename);
  });

  // ==================== USER CREDITS, PAYMENTS & NOTIFICATIONS ====================

  app.get('/api/credits/history', requireUser, (req, res) => {
    const user = (req as any).user;
    const transactions = db.prepare(`
      SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 200
    `).all(user.id);
    res.json({ success: true, transactions });
  });

  app.get('/api/payments/history', requireUser, (req, res) => {
    const user = (req as any).user;
    const payments = db.prepare(`
      SELECT id, order_id, amount_tzs, expected_credits, payment_phone, description, status, dsn_reference, credited, verified_at, created_at
      FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 200
    `).all(user.id);
    res.json({ success: true, payments });
  });

  app.post('/api/payments/initiate', requireUser, async (req, res) => {
    const user = (req as any).user;
    const amount = Number(req.body?.amount);
    const paymentPhone = normalizePhone(String(req.body?.phone || user.phone));

    if (!Number.isFinite(amount) || amount < 1000) {
      res.status(400).json({ success: false, message: 'Minimum deposit amount is TSh 1,000.' });
      return;
    }
    if (!isValidPhone(paymentPhone)) {
      res.status(400).json({ success: false, message: 'Please enter a valid mobile money phone number.' });
      return;
    }

    const creditRate = Math.max(1, Number(getSetting('credit_rate_tzs', '100')));
    const expectedCredits = Number((amount / creditRate).toFixed(2));
    if (expectedCredits <= 0) {
      res.status(400).json({ success: false, message: 'Deposit amount is below 1 credit conversion minimum.' });
      return;
    }

    const localOrderId = `DS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const dsnRes = await dsnCollectPayment(localOrderId, {
      amount: Math.round(amount),
      customer_phone: paymentPhone,
      customer_name: user.full_name,
      customer_email: '',
      description: 'DIGITAL SALES CREDIT PURCHASE',
    });

    const finalOrderId = dsnRes.orderId || localOrderId;

    if (!dsnRes.ok) {
      db.prepare(`
        INSERT INTO payments (order_id, user_id, amount_tzs, expected_credits, payment_phone, customer_name, description, status, dsn_reference)
        VALUES (?, ?, ?, ?, ?, ?, 'DIGITAL SALES CREDIT PURCHASE', 'Failed', ?)
      `).run(finalOrderId, user.id, Math.round(amount), expectedCredits, paymentPhone, user.full_name, dsnRes.reference || '');

      logActivity('user', user.id, `${user.full_name} (${user.phone})`, 'PAYMENT_INITIATE_FAILED', `Order ${finalOrderId}: ${dsnRes.message}`, getClientIp(req));
      res.status(dsnRes.httpStatus || 502).json({
        success: false,
        configured: dsnRes.configured,
        orderId: finalOrderId,
        message: dsnRes.message,
      });
      return;
    }

    db.prepare(`
      INSERT INTO payments (order_id, user_id, amount_tzs, expected_credits, payment_phone, customer_name, description, status, dsn_reference)
      VALUES (?, ?, ?, ?, ?, ?, 'DIGITAL SALES CREDIT PURCHASE', 'Pending', ?)
    `).run(finalOrderId, user.id, Math.round(amount), expectedCredits, paymentPhone, user.full_name, dsnRes.reference || '');

    logActivity('user', user.id, `${user.full_name} (${user.phone})`, 'PAYMENT_INITIATED', `Initiated DSN payment ${finalOrderId} for TSh ${Math.round(amount)}`, getClientIp(req));

    res.json({
      success: true,
      message: dsnRes.message,
      orderId: finalOrderId,
      amountTzs: Math.round(amount),
      expectedCredits,
      status: 'Pending',
    });
  });

  function applyDsnStatusUpdate(
    paymentId: number,
    dsnStatus: DsnStatusResult,
    ipAddress: string,
    source: 'user_poll' | 'admin_verify' | 'webhook'
  ): {
    status: 'Pending' | 'Success' | 'Failed';
    amountMismatch?: boolean;
    creditBalance?: number;
    alreadyCredited?: boolean;
  } {
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId) as any;
    if (!payment) return { status: 'Failed' };

    if (dsnStatus.normalizedStatus === 'Failed') {
      if (payment.status !== 'Success') {
        db.prepare(
          "UPDATE payments SET status = 'Failed', dsn_reference = COALESCE(NULLIF(?, ''), dsn_reference), updated_at = datetime('now') WHERE id = ? AND credited = 0"
        ).run(dsnStatus.reference || '', payment.id);
      }
      return { status: 'Failed' };
    }

    if (dsnStatus.normalizedStatus === 'Success') {
      if (dsnStatus.verifiedAmount !== undefined && dsnStatus.verifiedAmount < payment.amount_tzs) {
        return { status: 'Pending', amountMismatch: true };
      }

      const creditResult = db.transaction(() => {
        const lockedPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(payment.id) as any;
        const userRow = db.prepare('SELECT id, full_name, phone, credit_balance FROM users WHERE id = ?').get(lockedPayment.user_id) as any;
        if (lockedPayment.credited === 1) {
          return { alreadyCredited: true, newBalance: userRow.credit_balance };
        }

        const newBalance = Number((userRow.credit_balance + lockedPayment.expected_credits).toFixed(2));

        const upd = db.prepare(`
          UPDATE payments
          SET status = 'Success', credited = 1, verified_amount = ?, dsn_reference = COALESCE(NULLIF(?, ''), dsn_reference),
              verified_at = datetime('now'), updated_at = datetime('now')
          WHERE id = ? AND credited = 0
        `).run(dsnStatus.verifiedAmount ?? lockedPayment.amount_tzs, dsnStatus.reference || '', lockedPayment.id);

        if (upd.changes === 0) {
          return { alreadyCredited: true, newBalance: userRow.credit_balance };
        }

        db.prepare("UPDATE users SET credit_balance = ?, updated_at = datetime('now') WHERE id = ?").run(newBalance, userRow.id);

        db.prepare(`
          INSERT INTO credit_transactions (user_id, type, credits, balance_before, balance_after, reference_code, description)
          VALUES (?, 'purchase', ?, ?, ?, ?, ?)
        `).run(
          userRow.id,
          lockedPayment.expected_credits,
          userRow.credit_balance,
          newBalance,
          lockedPayment.order_id,
          `DSN payment verified (TSh ${lockedPayment.amount_tzs.toLocaleString()})`
        );

        createNotification(
          userRow.id,
          0,
          'payment_received',
          'Payment Received & Credits Added',
          `Payment ${lockedPayment.order_id} verified (TSh ${lockedPayment.amount_tzs.toLocaleString()}). ${lockedPayment.expected_credits} credits added to your account.`
        );
        createNotification(
          null,
          1,
          'payment_received',
          'Payment Confirmed',
          `${userRow.full_name} paid TSh ${lockedPayment.amount_tzs.toLocaleString()} (${lockedPayment.order_id}).`
        );
        logActivity(
          'user',
          userRow.id,
          `${userRow.full_name} (${userRow.phone})`,
          'PAYMENT_VERIFIED',
          `Order ${lockedPayment.order_id} verified via ${source} (+${lockedPayment.expected_credits} credits)`,
          ipAddress
        );

        return { alreadyCredited: false, newBalance };
      })();

      return {
        status: 'Success',
        alreadyCredited: creditResult.alreadyCredited,
        creditBalance: creditResult.newBalance,
      };
    }

    return { status: 'Pending' };
  }

  app.get('/api/payments/status/:orderId', requireUser, async (req, res) => {
    const user = (req as any).user;
    const orderId = String(req.params.orderId || '').trim();

    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ? AND user_id = ?').get(orderId, user.id) as any;
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment order not found.' });
      return;
    }

    if (payment.status === 'Success' && payment.credited === 1) {
      const freshUser = db.prepare('SELECT credit_balance FROM users WHERE id = ?').get(user.id) as { credit_balance: number };
      res.json({
        success: true,
        payment,
        creditBalance: freshUser.credit_balance,
        message: 'Payment already verified and credited.',
      });
      return;
    }

    if (payment.status === 'Failed') {
      res.json({
        success: true,
        payment,
        message: 'Payment failed or was cancelled.',
      });
      return;
    }

    const dsnStatus = await dsnCheckStatus(orderId, orderId);
    if (!dsnStatus.ok) {
      res.status(dsnStatus.httpStatus || 502).json({
        success: false,
        payment,
        message: dsnStatus.message,
      });
      return;
    }

    const outcome = applyDsnStatusUpdate(payment.id, dsnStatus, getClientIp(req), 'user_poll');
    if (outcome.amountMismatch) {
      res.status(400).json({
        success: false,
        payment,
        message: `Verified payment amount (${dsnStatus.verifiedAmount}) does not match expected amount (${payment.amount_tzs}).`,
      });
      return;
    }

    const updated = db.prepare('SELECT * FROM payments WHERE id = ?').get(payment.id);
    if (outcome.status === 'Failed') {
      res.json({ success: true, payment: updated, message: 'Payment failed or was cancelled.' });
      return;
    }
    if (outcome.status === 'Success') {
      res.json({
        success: true,
        payment: updated,
        creditBalance: outcome.creditBalance,
        message: `Payment verified! ${payment.expected_credits} credits added to your balance.`,
      });
      return;
    }

    res.json({
      success: true,
      payment: updated,
      message: 'Payment is still pending confirmation on mobile phone.',
    });
  });

  app.get('/api/notifications', requireUser, (req, res) => {
    const user = (req as any).user;
    const notifications = db.prepare(`
      SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50
    `).all(user.id);
    res.json({ success: true, notifications });
  });

  app.post('/api/notifications/read', requireUser, (req, res) => {
    const user = (req as any).user;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(user.id);
    res.json({ success: true });
  });

  // ==================== ADMIN AUTH & CONTROLS ====================

  app.post('/api/admin/login', (req, res) => {
    const { identifier, password } = req.body || {};
    const cleanInput = String(identifier || '').trim();
    const cleanPhone = normalizePhone(cleanInput);
    const rawPassword = String(password || '');

    const admin = db.prepare(`
      SELECT * FROM admins WHERE username = ? OR phone = ?
    `).get(cleanInput, cleanPhone) as any;

    if (!admin || !verifyPassword(rawPassword, admin.password_hash)) {
      logActivity('admin', null, cleanInput || 'unknown', 'ADMIN_LOGIN_FAILED', 'Invalid admin credentials attempt', getClientIp(req));
      res.status(401).json({ success: false, message: 'Invalid admin username/phone or password.' });
      return;
    }
    if (admin.is_active !== 1) {
      res.status(403).json({ success: false, message: 'Admin account is disabled.' });
      return;
    }

    db.prepare("UPDATE admins SET last_login_at = datetime('now') WHERE id = ?").run(admin.id);

    const token = signToken({ id: admin.id, type: 'admin', exp: Date.now() + 24 * 60 * 60 * 1000 });
    res.cookie(ADMIN_COOKIE_NAME, token, getCookieOptions(req, true, 24 * 60 * 60 * 1000));

    logActivity('admin', admin.id, admin.full_name, 'ADMIN_LOGIN', 'Admin logged into Admin Dashboard', getClientIp(req));

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        username: admin.username,
        phone: admin.phone,
        role: admin.role,
      },
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    const admin = getAuthedAdmin(req);
    if (admin) {
      logActivity('admin', admin.id, admin.full_name, 'ADMIN_LOGOUT', 'Admin logged out', getClientIp(req));
    }
    res.clearCookie(ADMIN_COOKIE_NAME, getCookieOptions(req, true, 0));
    res.json({ success: true });
  });

  app.get('/api/admin/me', (req, res) => {
    const admin = getAuthedAdmin(req);
    res.json({ success: true, authenticated: Boolean(admin), admin: admin || null });
  });

  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    const usersTotal = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as any).cnt;
    const usersActive = (db.prepare("SELECT COUNT(*) as cnt FROM users WHERE status = 'active'").get() as any).cnt;
    const totalUserCredits = (db.prepare('SELECT COALESCE(SUM(credit_balance), 0) as total FROM users').get() as any).total;
    const reqSubmitted = (db.prepare("SELECT COUNT(*) as cnt FROM requests WHERE status = 'Submitted'").get() as any).cnt;
    const reqCompleted = (db.prepare("SELECT COUNT(*) as cnt FROM requests WHERE status = 'Completed'").get() as any).cnt;
    const reqRejected = (db.prepare("SELECT COUNT(*) as cnt FROM requests WHERE status = 'Rejected'").get() as any).cnt;
    const paymentsSuccess = (db.prepare("SELECT COALESCE(SUM(amount_tzs), 0) as total, COUNT(*) as cnt FROM payments WHERE status = 'Success'").get() as any);
    const paymentsPending = (db.prepare("SELECT COUNT(*) as cnt FROM payments WHERE status = 'Pending'").get() as any).cnt;
    const servicesActive = (db.prepare('SELECT COUNT(*) as cnt FROM services WHERE is_active = 1').get() as any).cnt;
    const unreadAdminNotifications = db.prepare('SELECT * FROM notifications WHERE admin_target = 1 ORDER BY id DESC LIMIT 20').all();

    res.json({
      success: true,
      stats: {
        usersTotal,
        usersActive,
        totalUserCredits,
        reqSubmitted,
        reqCompleted,
        reqRejected,
        totalCollectedTzs: paymentsSuccess.total,
        successfulPaymentsCount: paymentsSuccess.cnt,
        pendingPaymentsCount: paymentsPending,
        servicesActive,
      },
      notifications: unreadAdminNotifications,
    });
  });

  // Admin: User Management
  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const q = String(req.query.q || '').trim();
    let users: any[];
    if (q) {
      const like = `%${q}%`;
      users = db.prepare(`
        SELECT id, full_name, phone, credit_balance, status, created_at,
          (SELECT COUNT(*) FROM requests r WHERE r.user_id = users.id) as request_count
        FROM users
        WHERE full_name LIKE ? OR phone LIKE ?
        ORDER BY id DESC
      `).all(like, like);
    } else {
      users = db.prepare(`
        SELECT id, full_name, phone, credit_balance, status, created_at,
          (SELECT COUNT(*) FROM requests r WHERE r.user_id = users.id) as request_count
        FROM users
        ORDER BY id DESC
      `).all();
    }
    res.json({ success: true, users });
  });

  app.post('/api/admin/users/:id/status', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const userId = Number(req.params.id);
    const status = req.body?.status === 'suspended' ? 'suspended' : 'active';
    const user = db.prepare('SELECT id, full_name, phone FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    db.prepare("UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, userId);
    logActivity('admin', admin.id, admin.full_name, 'USER_STATUS_UPDATED', `Set user ${user.full_name} (${user.phone}) to ${status}`, getClientIp(req));
    res.json({ success: true, message: `User status updated to ${status}.` });
  });

  app.post('/api/admin/users/:id/credits', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const userId = Number(req.params.id);
    const credits = Number(req.body?.credits);
    const reason = String(req.body?.reason || 'Admin credit adjustment').trim();

    if (!Number.isFinite(credits) || credits <= 0) {
      res.status(400).json({ success: false, message: 'Please enter a positive credit amount.' });
      return;
    }

    try {
      const result = db.transaction(() => {
        const user = db.prepare('SELECT id, full_name, phone, credit_balance FROM users WHERE id = ?').get(userId) as any;
        if (!user) throw new Error('USER_NOT_FOUND');
        const newBalance = Number((user.credit_balance + credits).toFixed(2));
        db.prepare("UPDATE users SET credit_balance = ?, updated_at = datetime('now') WHERE id = ?").run(newBalance, userId);

        const ref = `ADM-CR-${Date.now().toString(36).toUpperCase()}`;
        db.prepare(`
          INSERT INTO credit_transactions (user_id, type, credits, balance_before, balance_after, reference_code, description)
          VALUES (?, 'admin_add', ?, ?, ?, ?, ?)
        `).run(userId, credits, user.credit_balance, newBalance, ref, reason);

        createNotification(
          userId,
          0,
          'credit_added',
          'Credits Added by Admin',
          `${credits} credits were added to your account (${reason}). New balance: ${newBalance} credits.`
        );
        logActivity('admin', admin.id, admin.full_name, 'ADMIN_ADD_CREDITS', `Added ${credits} credits to ${user.full_name} (${user.phone}): ${reason}`, getClientIp(req));
        return { newBalance, user };
      })();

      res.json({
        success: true,
        message: `Added ${credits} credits to ${result.user.full_name}. New balance: ${result.newBalance}.`,
        creditBalance: result.newBalance,
      });
    } catch (err: any) {
      if (err.message === 'USER_NOT_FOUND') {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to add credits.' });
    }
  });

  app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const userId = Number(req.params.id);
    const user = db.prepare('SELECT id, full_name, phone FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    logActivity('admin', admin.id, admin.full_name, 'USER_DELETED', `Deleted user ${user.full_name} (${user.phone})`, getClientIp(req));
    res.json({ success: true, message: `User ${user.full_name} deleted.` });
  });

  app.get('/api/admin/users/:id/history', requireAdmin, (req, res) => {
    const userId = Number(req.params.id);
    const requests = db.prepare(`
      SELECT r.id, r.request_code, s.name as service_name, r.credits_charged, r.status, r.created_at
      FROM requests r JOIN services s ON s.id = r.service_id
      WHERE r.user_id = ? ORDER BY r.id DESC
    `).all(userId);
    const creditTransactions = db.prepare(`
      SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY id DESC
    `).all(userId);
    res.json({ success: true, requests, creditTransactions });
  });

  // Admin: Request Management
  app.get('/api/admin/requests', requireAdmin, (req, res) => {
    const status = String(req.query.status || '').trim();
    const whereClause = status && ['Submitted', 'Completed', 'Rejected'].includes(status) ? 'WHERE r.status = ?' : '';
    const rows = (whereClause
      ? db.prepare(`
          SELECT r.*, u.full_name as user_name, u.phone as user_phone, s.name as service_name, s.category as service_category
          FROM requests r
          JOIN users u ON u.id = r.user_id
          JOIN services s ON s.id = r.service_id
          ${whereClause}
          ORDER BY r.id DESC
        `).all(status)
      : db.prepare(`
          SELECT r.*, u.full_name as user_name, u.phone as user_phone, s.name as service_name, s.category as service_category
          FROM requests r
          JOIN users u ON u.id = r.user_id
          JOIN services s ON s.id = r.service_id
          ORDER BY r.id DESC
        `).all()) as any[];

    const docStmt = db.prepare('SELECT id, field_label, original_filename, mime_type, file_size, uploaded_at FROM request_documents WHERE request_id = ?');
    const compStmt = db.prepare('SELECT id, original_filename, mime_type, file_size, result_note, uploaded_at FROM completed_documents WHERE request_id = ?');

    const requests = rows.map((r) => ({
      ...r,
      submitted_data: JSON.parse(r.submitted_data_json || '{}'),
      documents: docStmt.all(r.id),
      completed_documents: compStmt.all(r.id),
    }));

    res.json({ success: true, requests });
  });

  app.post('/api/admin/requests/:id/process', requireAdmin, (req, res) => {
    secureUpload.single('completedFile')(req, res, (uploadErr: any) => {
      if (uploadErr) {
        res.status(400).json({ success: false, message: uploadErr.message || 'Upload failed.' });
        return;
      }

      const admin = (req as any).admin;
      const requestId = Number(req.params.id);
      const action = String(req.body?.action || '').trim(); // 'complete' | 'reject'
      const resultSummary = String(req.body?.resultSummary || '').trim();
      const rejectionReason = String(req.body?.rejectionReason || '').trim();
      const internalNotes = String(req.body?.internalNotes || '').trim();
      const refundCredits = req.body?.refundCredits === 'true' || req.body?.refundCredits === true;
      const file = (req as any).file as Express.Multer.File | undefined;

      const reqRow = db.prepare(`
        SELECT r.*, s.name as service_name, u.full_name as user_name, u.phone as user_phone
        FROM requests r
        JOIN services s ON s.id = r.service_id
        JOIN users u ON u.id = r.user_id
        WHERE r.id = ?
      `).get(requestId) as any;

      if (!reqRow) {
        if (file) { try { fs.unlinkSync(file.path); } catch { /* ignore */ } }
        res.status(404).json({ success: false, message: 'Request not found.' });
        return;
      }

      if (action === 'complete') {
        if (!file && !resultSummary) {
          res.status(400).json({
            success: false,
            message: 'Upload the actual completed document or enter the authorized service result before approving.',
          });
          return;
        }

        db.transaction(() => {
          if (file) {
            db.prepare(`
              INSERT INTO completed_documents (request_id, uploaded_by, original_filename, stored_filename, mime_type, file_size, result_note)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(requestId, admin.id, file.originalname, file.filename, file.mimetype, file.size, resultSummary);
          }

          db.prepare(`
            UPDATE requests
            SET status = 'Completed',
                result_summary = ?,
                admin_internal_notes = ?,
                processed_by = ?,
                processed_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ?
          `).run(resultSummary || 'Authorized document ready for download.', internalNotes, admin.id, requestId);

          createNotification(
            reqRow.user_id,
            0,
            'request_completed',
            'Service Request Completed',
            `Your request ${reqRow.request_code} (${reqRow.service_name}) is completed. Open My Requests to download your result.`
          );
          logActivity('admin', admin.id, admin.full_name, 'REQUEST_COMPLETED', `Completed request ${reqRow.request_code} for ${reqRow.user_name}`, getClientIp(req));
        })();

        res.json({ success: true, message: `Request ${reqRow.request_code} approved and marked Completed.` });
        return;
      }

      if (action === 'reject') {
        if (file) { try { fs.unlinkSync(file.path); } catch { /* ignore */ } }
        if (!rejectionReason) {
          res.status(400).json({ success: false, message: 'Please provide a rejection reason.' });
          return;
        }

        db.transaction(() => {
          db.prepare(`
            UPDATE requests
            SET status = 'Rejected',
                rejection_reason = ?,
                admin_internal_notes = ?,
                processed_by = ?,
                processed_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ?
          `).run(rejectionReason, internalNotes, admin.id, requestId);

          if (refundCredits && reqRow.status === 'Submitted') {
            const u = db.prepare('SELECT credit_balance FROM users WHERE id = ?').get(reqRow.user_id) as { credit_balance: number };
            const newBal = Number((u.credit_balance + reqRow.credits_charged).toFixed(2));
            db.prepare("UPDATE users SET credit_balance = ?, updated_at = datetime('now') WHERE id = ?").run(newBal, reqRow.user_id);
            db.prepare(`
              INSERT INTO credit_transactions (user_id, type, credits, balance_before, balance_after, reference_code, description)
              VALUES (?, 'refund', ?, ?, ?, ?, ?)
            `).run(reqRow.user_id, reqRow.credits_charged, u.credit_balance, newBal, reqRow.request_code, `Credit refund on rejected request ${reqRow.request_code}`);
          }

          createNotification(
            reqRow.user_id,
            0,
            'request_rejected',
            'Service Request Rejected',
            `Your request ${reqRow.request_code} (${reqRow.service_name}) was rejected: ${rejectionReason}`
          );
          logActivity('admin', admin.id, admin.full_name, 'REQUEST_REJECTED', `Rejected ${reqRow.request_code}: ${rejectionReason}`, getClientIp(req));
        })();

        res.json({ success: true, message: `Request ${reqRow.request_code} marked Rejected.` });
        return;
      }

      if (file) { try { fs.unlinkSync(file.path); } catch { /* ignore */ } }
      res.status(400).json({ success: false, message: 'Invalid action.' });
    });
  });

  // Admin: Service Management
  app.get('/api/admin/services', requireAdmin, (_req, res) => {
    const services = db.prepare('SELECT * FROM services ORDER BY sort_order ASC, id ASC').all() as any[];
    const reqStmt = db.prepare('SELECT * FROM service_requirements WHERE service_id = ? ORDER BY sort_order ASC, id ASC');
    res.json({
      success: true,
      services: services.map((s) => ({ ...s, requirements: reqStmt.all(s.id) })),
    });
  });

  app.post('/api/admin/services', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const { category, name, description, requirements_summary, credit_cost, is_active, requirements } = req.body || {};
    if (!category || !name || !description) {
      res.status(400).json({ success: false, message: 'Category, service name, and description are required.' });
      return;
    }

    const slug = `${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;
    const cost = Math.max(0, Number(credit_cost ?? 2));

    const svcId = db.transaction(() => {
      const ins = db.prepare(`
        INSERT INTO services (category, name, slug, description, requirements_summary, credit_cost, is_active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, 99)
      `).run(category, name.trim(), slug, description.trim(), String(requirements_summary || '').trim(), cost, is_active === false ? 0 : 1);

      const newId = Number(ins.lastInsertRowid);
      if (Array.isArray(requirements)) {
        const reqIns = db.prepare(`
          INSERT INTO service_requirements (service_id, field_label, field_name, field_type, is_required, accepted_formats, placeholder, sort_order)
          VALUES (?, ?, ?, ?, ?, 'PDF,JPG,JPEG,PNG', ?, ?)
        `);
        requirements.forEach((r: any, idx: number) => {
          if (r.field_label) {
            const fname = String(r.field_name || r.field_label).toLowerCase().replace(/[^a-z0-9]+/g, '_');
            reqIns.run(newId, r.field_label, fname, r.field_type || 'text', r.is_required ? 1 : 0, r.placeholder || '', idx + 1);
          }
        });
      }
      logActivity('admin', admin.id, admin.full_name, 'SERVICE_CREATED', `Created service ${name} (${category})`, getClientIp(req));
      return newId;
    })();

    res.status(201).json({ success: true, id: svcId, message: 'Service created successfully.' });
  });

  app.put('/api/admin/services/:id', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const svcId = Number(req.params.id);
    const { category, name, description, requirements_summary, credit_cost, is_active, requirements } = req.body || {};

    const existing = db.prepare('SELECT id FROM services WHERE id = ?').get(svcId);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Service not found.' });
      return;
    }

    db.transaction(() => {
      db.prepare(`
        UPDATE services
        SET category = ?, name = ?, description = ?, requirements_summary = ?, credit_cost = ?, is_active = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(category, String(name).trim(), String(description).trim(), String(requirements_summary || '').trim(), Math.max(0, Number(credit_cost ?? 2)), is_active ? 1 : 0, svcId);

      if (Array.isArray(requirements)) {
        db.prepare('DELETE FROM service_requirements WHERE service_id = ?').run(svcId);
        const reqIns = db.prepare(`
          INSERT INTO service_requirements (service_id, field_label, field_name, field_type, is_required, accepted_formats, placeholder, sort_order)
          VALUES (?, ?, ?, ?, ?, 'PDF,JPG,JPEG,PNG', ?, ?)
        `);
        requirements.forEach((r: any, idx: number) => {
          if (r.field_label) {
            const fname = String(r.field_name || r.field_label).toLowerCase().replace(/[^a-z0-9]+/g, '_');
            reqIns.run(svcId, r.field_label, fname, r.field_type || 'text', r.is_required ? 1 : 0, r.placeholder || '', idx + 1);
          }
        });
      }
      logActivity('admin', admin.id, admin.full_name, 'SERVICE_UPDATED', `Updated service #${svcId} (${name})`, getClientIp(req));
    })();

    res.json({ success: true, message: 'Service updated successfully.' });
  });

  app.delete('/api/admin/services/:id', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const svcId = Number(req.params.id);
    const used = (db.prepare('SELECT COUNT(*) as cnt FROM requests WHERE service_id = ?').get(svcId) as any).cnt;
    if (used > 0) {
      db.prepare("UPDATE services SET is_active = 0, updated_at = datetime('now') WHERE id = ?").run(svcId);
      logActivity('admin', admin.id, admin.full_name, 'SERVICE_DEACTIVATED', `Deactivated service #${svcId} (has existing requests)`, getClientIp(req));
      res.json({ success: true, message: 'Service has existing requests and was deactivated instead of permanently deleted.' });
      return;
    }

    db.prepare('DELETE FROM services WHERE id = ?').run(svcId);
    logActivity('admin', admin.id, admin.full_name, 'SERVICE_DELETED', `Deleted service #${svcId}`, getClientIp(req));
    res.json({ success: true, message: 'Service deleted successfully.' });
  });

  // Admin: Payments & Reports
  app.get('/api/admin/payments', requireAdmin, (req, res) => {
    const status = String(req.query.status || '').trim();
    const payments = status && ['Pending', 'Success', 'Failed'].includes(status)
      ? db.prepare(`
          SELECT p.*, u.full_name as user_name, u.phone as user_phone
          FROM payments p JOIN users u ON u.id = p.user_id
          WHERE p.status = ? ORDER BY p.id DESC LIMIT 300
        `).all(status)
      : db.prepare(`
          SELECT p.*, u.full_name as user_name, u.phone as user_phone
          FROM payments p JOIN users u ON u.id = p.user_id
          ORDER BY p.id DESC LIMIT 300
        `).all();

    const summary = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'Success' THEN amount_tzs ELSE 0 END), 0) as total_collected,
        COUNT(CASE WHEN status = 'Success' THEN 1 END) as count_success,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as count_pending,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as count_failed
      FROM payments
    `).get();

    res.json({ success: true, payments, summary });
  });

  app.post('/api/admin/payments/:orderId/verify', requireAdmin, async (req, res) => {
    const admin = (req as any).admin;
    const orderId = String(req.params.orderId || '').trim();
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId) as any;
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment order not found.' });
      return;
    }

    const dsnStatus = await dsnCheckStatus(orderId, orderId);
    if (!dsnStatus.ok) {
      res.status(dsnStatus.httpStatus || 502).json({ success: false, message: dsnStatus.message });
      return;
    }

    const outcome = applyDsnStatusUpdate(payment.id, dsnStatus, getClientIp(req), 'admin_verify');
    if (outcome.amountMismatch) {
      res.status(400).json({ success: false, message: 'Verified amount mismatch.' });
      return;
    }

    if (outcome.status === 'Success' && !outcome.alreadyCredited) {
      logActivity('admin', admin.id, admin.full_name, 'ADMIN_PAYMENT_VERIFIED', `Verified ${payment.order_id}`, getClientIp(req));
    }

    const updated = db.prepare('SELECT * FROM payments WHERE id = ?').get(payment.id);
    res.json({ success: true, payment: updated, message: dsnStatus.message });
  });

  // Admin: DSN Merchant Balance
  app.get('/api/admin/merchant-balance', requireAdmin, async (req, res) => {
    const admin = (req as any).admin;
    const balance = await dsnFetchMerchantBalance(admin.id);
    const history = db.prepare('SELECT * FROM merchant_balance_logs ORDER BY id DESC LIMIT 15').all();
    res.json({ success: true, balance, history });
  });

  // Admin: Withdrawal System (Ready interface, strictly not inventing DSN withdrawal APIs)
  app.get('/api/admin/withdrawals', requireAdmin, (_req, res) => {
    const withdrawals = db.prepare(`
      SELECT w.*, a.full_name as admin_name
      FROM withdrawals w JOIN admins a ON a.id = w.admin_id
      ORDER BY w.id DESC LIMIT 100
    `).all();
    const apiActive = getSetting('withdrawal_api_active', '0') === '1';
    res.json({ success: true, withdrawals, withdrawalApiActive: apiActive });
  });

  app.post('/api/admin/withdrawals', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const { amount, network, recipientPhone, recipientName, notes } = req.body || {};
    const numAmount = Number(amount);
    const cleanPhone = normalizePhone(String(recipientPhone || ''));
    const validNetworks = ['Airtel Money', 'Yas Pesa', 'M-Pesa', 'HaloPesa'];

    if (!Number.isFinite(numAmount) || numAmount < 1000) {
      res.status(400).json({ success: false, message: 'Minimum withdrawal amount is TSh 1,000.' });
      return;
    }
    if (!validNetworks.includes(String(network))) {
      res.status(400).json({ success: false, message: 'Invalid mobile money network selected.' });
      return;
    }
    if (!isValidPhone(cleanPhone) || !String(recipientName || '').trim()) {
      res.status(400).json({ success: false, message: 'Valid recipient phone number and name are required.' });
      return;
    }

    const withdrawalCode = `WD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    db.prepare(`
      INSERT INTO withdrawals (withdrawal_code, admin_id, amount_tzs, network, recipient_phone, recipient_name, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)
    `).run(withdrawalCode, admin.id, Math.round(numAmount), network, cleanPhone, String(recipientName).trim(), String(notes || '').trim());

    logActivity('admin', admin.id, admin.full_name, 'WITHDRAWAL_QUEUED', `Recorded withdrawal ${withdrawalCode} for TSh ${Math.round(numAmount)} via ${network} to ${cleanPhone}`, getClientIp(req));

    res.status(201).json({
      success: true,
      withdrawalCode,
      message: `Withdrawal ${withdrawalCode} saved as Pending. Automated payout executes only after official DSN Technology withdrawal API activation.`,
    });
  });

  // Admin: Logs, Credit Reports, Settings, Backups
  app.get('/api/admin/logs', requireAdmin, (_req, res) => {
    const activityLogs = db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 150').all();
    const paymentLogs = db.prepare('SELECT * FROM payment_logs ORDER BY id DESC LIMIT 100').all();
    const creditTransactions = db.prepare(`
      SELECT ct.*, u.full_name as user_name, u.phone as user_phone
      FROM credit_transactions ct JOIN users u ON u.id = ct.user_id
      ORDER BY ct.id DESC LIMIT 150
    `).all();
    const creditReport = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'purchase' THEN credits ELSE 0 END), 0) as total_purchased,
        COALESCE(SUM(CASE WHEN type = 'admin_add' THEN credits ELSE 0 END), 0) as total_admin_added,
        COALESCE(SUM(CASE WHEN type = 'deduction' THEN ABS(credits) ELSE 0 END), 0) as total_deducted,
        COALESCE(SUM(CASE WHEN type = 'refund' THEN credits ELSE 0 END), 0) as total_refunded
      FROM credit_transactions
    `).get();
    res.json({ success: true, activityLogs, paymentLogs, creditTransactions, creditReport });
  });

  app.get('/api/admin/settings', requireAdmin, (_req, res) => {
    const rows = db.prepare('SELECT * FROM system_settings ORDER BY setting_key ASC').all() as any[];
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.setting_key] = r.setting_value;
    res.json({
      success: true,
      settings,
      dsnApiKeyConfigured: Boolean(process.env.DSN_API_KEY),
      databaseEngine: 'SQLite (Live Preview) + MySQL 8 / InfinityFree PHP Package Ready',
    });
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const { credit_rate_tzs, default_request_cost, dsn_user_id, support_phone, newAdminPassword } = req.body || {};

    const upd = db.prepare("UPDATE system_settings SET setting_value = ?, updated_at = datetime('now') WHERE setting_key = ?");
    if (credit_rate_tzs !== undefined && Number(credit_rate_tzs) >= 1) {
      upd.run(String(Math.round(Number(credit_rate_tzs))), 'credit_rate_tzs');
    }
    if (default_request_cost !== undefined && Number(default_request_cost) >= 0) {
      upd.run(String(Number(default_request_cost)), 'default_request_cost');
    }
    if (dsn_user_id) {
      upd.run(String(dsn_user_id).trim(), 'dsn_user_id');
    }
    if (support_phone) {
      upd.run(normalizePhone(String(support_phone)), 'support_phone');
    }

    if (newAdminPassword && String(newAdminPassword).length >= 6) {
      db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hashPassword(String(newAdminPassword)), admin.id);
      logActivity('admin', admin.id, admin.full_name, 'ADMIN_PASSWORD_CHANGED', 'Admin updated password', getClientIp(req));
    }

    logActivity('admin', admin.id, admin.full_name, 'SETTINGS_UPDATED', 'Updated system settings', getClientIp(req));
    res.json({ success: true, message: 'System settings saved successfully.' });
  });

  app.post('/api/admin/notifications/broadcast', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const { title, message } = req.body || {};
    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Title and message are required.' });
      return;
    }
    const users = db.prepare("SELECT id FROM users WHERE status = 'active'").all() as Array<{ id: number }>;
    db.transaction(() => {
      for (const u of users) {
        createNotification(u.id, 0, 'system_announcement', String(title).trim(), String(message).trim());
      }
    })();
    logActivity('admin', admin.id, admin.full_name, 'SYSTEM_BROADCAST', `Sent notification "${title}" to ${users.length} active users`, getClientIp(req));
    res.json({ success: true, message: `Notification sent to ${users.length} active users.` });
  });

  app.get('/api/admin/backup', requireAdmin, (req, res) => {
    const admin = (req as any).admin;
    const tables = [
      'users', 'services', 'service_requirements', 'requests', 'request_documents',
      'completed_documents', 'credit_transactions', 'payments', 'payment_logs',
      'merchant_balance_logs', 'withdrawals', 'notifications', 'activity_logs', 'system_settings',
    ];
    const dump: Record<string, any[]> = {};
    for (const t of tables) {
      dump[t] = db.prepare(`SELECT * FROM ${t}`).all();
    }
    logActivity('admin', admin.id, admin.full_name, 'BACKUP_EXPORTED', 'Exported complete JSON database backup', getClientIp(req));
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="digital-sales-pro-max-backup-${Date.now()}.json"`);
    res.send(JSON.stringify({ exportedAt: new Date().toISOString(), tables: dump }, null, 2));
  });

  app.get('/api/admin/export-php-package', requireAdmin, async (req, res) => {
    const admin = (req as any).admin;
    const phpDir = path.resolve(__dirname, 'php-infinityfree');
    if (!fs.existsSync(phpDir)) {
      res.status(404).json({ success: false, message: 'PHP InfinityFree package folder not found.' });
      return;
    }

    const zip = new JSZip();
    function addFolderToZip(folderPath: string, zipFolder: JSZip) {
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(folderPath, entry.name);
        if (entry.isDirectory()) {
          const sub = zipFolder.folder(entry.name);
          if (sub) addFolderToZip(fullPath, sub);
        } else {
          zipFolder.file(entry.name, fs.readFileSync(fullPath));
        }
      }
    }
    addFolderToZip(phpDir, zip);

    const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    logActivity('admin', admin.id, admin.full_name, 'PHP_PACKAGE_EXPORTED', 'Downloaded InfinityFree PHP 8+ & MySQL package', getClientIp(req));
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="digital-sales-pro-max-php-infinityfree.zip"');
    res.send(buffer);
  });

  // Never let unmatched /api/* routes fall through to SPA HTML
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found.' });
  });

  // Global JSON error handler for /api/*
  app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled API error:', err);
    res.status(err?.status || 500).json({
      success: false,
      message: err?.message || 'Internal server error.',
    });
  });

  // Vite / Static SPA fallback (supports / and /admin/ cleanly)
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const devDistDir = path.resolve(__dirname, 'dev-dist');
    app.get(/^\/workbox-[^/]+\.js$/, (req, res, next) => {
      const candidate = path.join(devDistDir, path.basename(req.path));
      if (fs.existsSync(candidate)) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(candidate);
        return;
      }
      next();
    });
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('sw.js')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else if (filePath.endsWith('.webmanifest')) {
            res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DIGITAL SALES PRO MAX running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

import crypto from 'crypto';
import path from 'path';
import multer from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { UPLOAD_DIR, db } from './db.js';

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update('digital-sales-pro-max-runtime-secret-key').digest('hex');

export const USER_COOKIE_NAME = 'ds_user_session';
export const ADMIN_COOKIE_NAME = 'ds_admin_session';
export const CSRF_COOKIE_NAME = 'ds_csrf_token';

interface SessionPayload {
  id: number;
  type: 'user' | 'admin';
  exp: number;
}

export function isHttpsRequest(req: Request): boolean {
  if (req.secure) return true;
  const proto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  return proto.includes('https');
}

export function getCookieOptions(req: Request, httpOnly: boolean, maxAgeMs: number) {
  const https = isHttpsRequest(req);
  return {
    httpOnly,
    sameSite: (https ? 'none' : 'lax') as 'none' | 'lax',
    secure: https,
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function signToken(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifyToken(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function normalizePhone(raw: string): string {
  let digits = (raw || '').replace(/\D/g, '');
  if (digits.startsWith('00255')) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('2550') && (digits.length === 13 || digits.length === 12)) {
    return digits.slice(3);
  }
  if (digits.startsWith('255') && digits.length === 12) {
    return '0' + digits.slice(3);
  }
  if (/^[67]\d{8}$/.test(digits)) {
    return '0' + digits;
  }
  return digits;
}

export function getPhoneCandidates(raw: string): string[] {
  const digits = (raw || '').replace(/\D/g, '');
  const normalized = normalizePhone(raw);
  const set = new Set<string>();
  if (normalized) set.add(normalized);
  if (digits) set.add(digits);
  if (normalized.startsWith('0') && normalized.length >= 10) {
    set.add(normalized.slice(1));
    set.add('255' + normalized.slice(1));
    set.add('255' + normalized);
  }
  return Array.from(set).filter(Boolean);
}

export function isValidPhone(phone: string): boolean {
  return /^0[67]\d{8}$/.test(phone) || /^\d{9,15}$/.test(phone);
}

export function validateThreeNames(fullName: string): boolean {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 3 && parts.every((p) => p.length >= 2);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || '';
}

function createSignedCsrfToken(): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(`csrf:${nonce}`).digest('hex');
  return `${nonce}.${sig}`;
}

function verifySignedCsrfToken(token: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [nonce, sig] = token.split('.');
  if (!nonce || !sig) return false;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(`csrf:${nonce}`).digest('hex');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
}

export function issueCsrfToken(req: Request, res: Response): string {
  let token = req.cookies?.[CSRF_COOKIE_NAME];
  if (!token || typeof token !== 'string' || !verifySignedCsrfToken(token)) {
    token = createSignedCsrfToken();
  }
  res.cookie(CSRF_COOKIE_NAME, token, getCookieOptions(req, false, 7 * 24 * 60 * 60 * 1000));
  return token;
}

export function verifyCsrf(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  const headerToken = String(req.headers['x-csrf-token'] || '');
  const cookieToken = String(req.cookies?.[CSRF_COOKIE_NAME] || '');

  const cookieMatches = Boolean(cookieToken && headerToken && cookieToken === headerToken);
  const signedValid = verifySignedCsrfToken(headerToken);

  if (!cookieMatches && !signedValid) {
    res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF security token. Please refresh and try again.',
    });
    return;
  }
  next();
}

export interface AuthedUser {
  id: number;
  full_name: string;
  phone: string;
  credit_balance: number;
  status: string;
  created_at: string;
}

export interface AuthedAdmin {
  id: number;
  full_name: string;
  username: string;
  phone: string;
  role: string;
}

export function getAuthedUser(req: Request): AuthedUser | null {
  const token =
    req.cookies?.[USER_COOKIE_NAME] ||
    (typeof req.headers['x-user-token'] === 'string' ? req.headers['x-user-token'] : undefined) ||
    (typeof req.query.user_token === 'string' ? req.query.user_token : undefined);
  const payload = verifyToken(token);
  if (!payload || payload.type !== 'user') return null;
  const user = db
    .prepare('SELECT id, full_name, phone, credit_balance, status, created_at FROM users WHERE id = ?')
    .get(payload.id) as AuthedUser | undefined;
  if (!user || user.status !== 'active') return null;
  return user;
}

export function getAuthedAdmin(req: Request): AuthedAdmin | null {
  const token =
    req.cookies?.[ADMIN_COOKIE_NAME] ||
    (typeof req.headers['x-admin-token'] === 'string' ? req.headers['x-admin-token'] : undefined) ||
    (typeof req.query.admin_token === 'string' ? req.query.admin_token : undefined);
  const payload = verifyToken(token);
  if (!payload || payload.type !== 'admin') return null;
  const admin = db
    .prepare('SELECT id, full_name, username, phone, role, is_active FROM admins WHERE id = ?')
    .get(payload.id) as (AuthedAdmin & { is_active: number }) | undefined;
  if (!admin || admin.is_active !== 1) return null;
  return admin;
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const user = getAuthedUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }
  (req as any).user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const admin = getAuthedAdmin(req);
  if (!admin) {
    res.status(401).json({ success: false, message: 'Admin authorization required.' });
    return;
  }
  (req as any).admin = admin;
  next();
}

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    cb(null, safeName);
  },
});

export const secureUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      cb(new Error('Unsupported file format. Only PDF, JPG, JPEG, and PNG files are allowed.'));
      return;
    }
    cb(null, true);
  },
});

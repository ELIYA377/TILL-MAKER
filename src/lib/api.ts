let cachedCsrfToken: string | null = null;

const USER_TOKEN_KEY = 'ds_user_token';
const ADMIN_TOKEN_KEY = 'ds_admin_token';

export function setUserToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(USER_TOKEN_KEY, token);
      sessionStorage.setItem(USER_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(USER_TOKEN_KEY);
      sessionStorage.removeItem(USER_TOKEN_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function getUserToken(): string {
  try {
    return localStorage.getItem(USER_TOKEN_KEY) || sessionStorage.getItem(USER_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
}

export function getAdminToken(): string {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function withUserDownloadToken(path: string): string {
  const token = getUserToken();
  if (!token) return path;
  return `${path}${path.includes('?') ? '&' : '?'}user_token=${encodeURIComponent(token)}`;
}

export function withAdminDownloadToken(path: string): string {
  const token = getAdminToken();
  if (!token) return path;
  return `${path}${path.includes('?') ? '&' : '?'}admin_token=${encodeURIComponent(token)}`;
}

export async function ensureCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  const res = await fetch('/api/csrf-token', { credentials: 'include' });
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    cachedCsrfToken = data.csrfToken || '';
    return cachedCsrfToken!;
  } catch {
    return '';
  }
}

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.replace(/<[^>]+>/g, ' ').trim().slice(0, 120);
    throw new Error(
      `Server returned an unexpected non-JSON response (HTTP ${res.status})${snippet ? `: ${snippet}` : ''}`
    );
  }
}

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});

  const userToken = getUserToken();
  const adminToken = getAdminToken();
  if (userToken && !headers.has('X-User-Token')) {
    headers.set('X-User-Token', userToken);
  }
  if (adminToken && !headers.has('X-Admin-Token')) {
    headers.set('X-Admin-Token', adminToken);
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = await ensureCsrfToken();
    if (csrf) headers.set('X-CSRF-Token', csrf);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });

  // If CSRF token rotated, refresh once and retry
  if (res.status === 403) {
    const cloneData = await res.clone().json().catch(() => null);
    if (cloneData?.message?.includes('CSRF')) {
      cachedCsrfToken = null;
      const freshCsrf = await ensureCsrfToken();
      if (freshCsrf) headers.set('X-CSRF-Token', freshCsrf);
      const retry = await fetch(url, { ...options, method, headers, credentials: 'include' });
      const retryData = await parseJsonResponse(retry);
      if (!retry.ok) throw new Error(retryData.message || `Request failed (${retry.status})`);
      return retryData as T;
    }
  }

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data as T;
}

export function formatTzs(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—';
  return `TSh ${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const normalized = iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z';
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

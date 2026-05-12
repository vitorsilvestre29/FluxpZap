export function buildUrl(path: string) {
  const base = getAppUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function redirectUrl(path: string, request: Request | string) {
  return new URL(path, getRedirectBaseUrl(request));
}

export function getAppUrl() {
  const base = process.env.APP_URL?.trim() || 'http://localhost:3000';
  const normalized = /^https?:\/\//i.test(base) ? base : `https://${base}`;
  return normalized.replace(/\/+$/, '');
}

function getRedirectBaseUrl(request: Request | string) {
  if (process.env.APP_URL?.trim()) return getAppUrl();

  if (typeof request === 'string') return request;

  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.url;
}

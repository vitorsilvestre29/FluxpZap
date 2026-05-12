export function buildUrl(path: string) {
  const base = process.env.APP_URL || 'http://localhost:3000';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function redirectUrl(path: string, requestUrl: string) {
  return new URL(path, process.env.APP_URL || requestUrl);
}

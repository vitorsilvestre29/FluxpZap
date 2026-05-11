export function logInfo(message: string, data?: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[INFO]', message, data ?? '');
  }
}

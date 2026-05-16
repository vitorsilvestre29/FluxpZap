type MailPayload = {
  to: string;
  subject: string;
  html: string;
};

let cachedTransport: {
  sendMail: (payload: MailPayload & { from: string }) => Promise<unknown>;
} | null = null;

async function getTransport() {
  if (cachedTransport) {
    return cachedTransport;
  }

  const nodemailer = await import('nodemailer');
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    throw new Error('SMTP is not configured');
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass: password },
  });

  cachedTransport = transport;
  return transport;
}

export async function sendMail(payload: MailPayload) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV EMAIL]', payload.subject, payload.to, payload.html);
    return;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_FROM;

  if (!from) {
    throw new Error('MAIL_FROM or SMTP_FROM is required in production');
  }

  const transport = await getTransport();
  await transport.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
}

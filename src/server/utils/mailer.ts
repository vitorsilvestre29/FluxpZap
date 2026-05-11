type MailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail(payload: MailPayload) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DEV EMAIL]', payload.subject, payload.to, payload.html);
  }
}

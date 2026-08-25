import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function sendDigestEmail(params: { subject: string; html: string }) {
  const from = process.env.DIGEST_FROM_EMAIL;
  const to = process.env.DIGEST_TO_EMAIL;
  if (!from || !to) {
    throw new Error("DIGEST_FROM_EMAIL and DIGEST_TO_EMAIL must be set");
  }

  return getResend().emails.send({
    from,
    to,
    subject: params.subject,
    html: params.html,
  });
}

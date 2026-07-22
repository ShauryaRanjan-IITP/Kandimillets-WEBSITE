/**
 * Email delivery — Resend. Mirrors this codebase's existing "gracefully
 * handle a missing integration credential" idiom already established by
 * `app/(site)/actions.ts`'s `submitInquiry` (checks
 * `GOOGLE_SHEETS_WEBHOOK_URL`, logs and returns an error state if unset,
 * rather than throwing): if `RESEND_API_KEY` isn't configured, this logs
 * a clear warning and resolves without sending, so local development
 * never needs real credentials and a missing key never crashes a
 * request. Never logs the email body/recipient/token — see this task's
 * "no sensitive logging" requirement.
 */
import { Resend } from "resend";

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "Kandimillets Admin <onboarding@resend.dev>";

let resendClient: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Never throws — a delivery failure must never break the caller's
 * request/response flow (especially the password-reset request endpoint,
 * which must always return its generic success message regardless of
 * whether the email actually went out). Returns whether it actually sent. */
export async function sendEmail(params: SendEmailParams): Promise<{ sent: boolean }> {
  const client = getClient();
  if (!client) {
    console.warn("sendEmail: RESEND_API_KEY is not configured — skipping delivery (dev/local fallback).");
    return { sent: false };
  }

  try {
    const result = await client.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    if (result.error) {
      console.error("sendEmail: Resend returned an error.", result.error.name);
      return { sent: false };
    }
    return { sent: true };
  } catch (error) {
    console.error("sendEmail: delivery failed.", error);
    return { sent: false };
  }
}

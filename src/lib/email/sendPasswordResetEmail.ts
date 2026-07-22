import { buildPasswordResetEmail } from "./templates/passwordReset";
import { sendEmail } from "./send";

export interface SendPasswordResetEmailParams {
  to: string;
  recipientName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

/** The single call site `auth.ts`'s `sendResetPassword` config uses —
 * keeps the template + transport concerns out of the auth config file
 * itself. */
export async function sendPasswordResetEmail(params: SendPasswordResetEmailParams): Promise<{ sent: boolean }> {
  const { subject, html, text } = buildPasswordResetEmail({
    recipientName: params.recipientName,
    resetUrl: params.resetUrl,
    expiresInMinutes: params.expiresInMinutes,
  });
  return sendEmail({ to: params.to, subject, html, text });
}

/**
 * Password Reset email template — this task's §3 "Create reusable email
 * templates... Keep templates: Responsive, Accessible, Professional,
 * Brand-consistent. No unnecessary styling." Plain, table-based HTML
 * (the only layout approach that renders consistently across email
 * clients — no Flexbox/Grid, no external stylesheet, no JS) with an
 * inline-styled single-column layout that reads fine on a phone without
 * any responsive media query trickery. Colors/fonts pull from the exact
 * same brand palette already defined in globals.css's `@theme`
 * (green-600 `#2E8B57`/`#228B22`, brown-900 `#271d0e`-ish, warm-50
 * `#fffefb`) rather than inventing a second palette for email.
 *
 * Returns both HTML and a plain-text alternative — every professional
 * transactional email includes a text part for accessibility (screen
 * readers/text-only clients) and deliverability (spam filters penalize
 * HTML-only email).
 */
export interface PasswordResetEmailParams {
  recipientName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const BRAND_GREEN = "#2E8B57";
const BRAND_BROWN = "#271d0e";
const BRAND_WARM_BG = "#fffefb";
const BRAND_MUTED = "#8a7a63";

export function buildPasswordResetEmail({
  recipientName,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailParams): EmailContent {
  const subject = "Reset your Kandimillets Admin Portal password";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND_WARM_BG}; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND_WARM_BG}; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e8e0d0; overflow: hidden;">
            <tr>
              <td style="padding: 32px 32px 8px 32px; text-align: center;">
                <span style="font-size: 20px; font-weight: 700; color: ${BRAND_GREEN};">Kandimillets</span>
                <div style="margin-top: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND_MUTED};">
                  Admin Portal
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 32px 0 32px;">
                <h1 style="margin: 0 0 16px 0; font-size: 20px; line-height: 1.3; color: ${BRAND_BROWN};">
                  Reset your password
                </h1>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: ${BRAND_BROWN};">
                  Hello ${escapeHtml(recipientName)},
                </p>
                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: ${BRAND_BROWN};">
                  We received a request to reset the password for your Kandimillets Admin Portal account.
                  Click the button below to choose a new password. This link expires in
                  ${expiresInMinutes} minutes and can only be used once.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 24px 32px; text-align: center;">
                <a href="${resetUrl}" style="display: inline-block; background-color: ${BRAND_GREEN}; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 12px;">
                  Reset Password
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 24px 32px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.6; color: ${BRAND_MUTED};">
                  If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; word-break: break-all;">
                  <a href="${resetUrl}" style="color: ${BRAND_GREEN};">${resetUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 32px 32px 32px; border-top: 1px solid #f0eadf; padding-top: 20px;">
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: ${BRAND_MUTED};">
                  If you didn't request this, you can safely ignore this email — your password will not be
                  changed. This link will simply expire on its own.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin: 20px 0 0 0; font-size: 12px; color: ${BRAND_MUTED};">
            Kandimillets Admin Portal — automated message, please do not reply.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Reset your Kandimillets Admin Portal password`,
    ``,
    `Hello ${recipientName},`,
    ``,
    `We received a request to reset the password for your Kandimillets Admin Portal account.`,
    `Open the link below to choose a new password. This link expires in ${expiresInMinutes} minutes and can only be used once.`,
    ``,
    resetUrl,
    ``,
    `If you didn't request this, you can safely ignore this email — your password will not be changed.`,
  ].join("\n");

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

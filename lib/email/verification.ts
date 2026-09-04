import { Resend } from "resend";
import type { UserRole } from "@/types/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  employer: "Employer",
  college_admin: "College Admin",
  alumni: "Alumni",
  placement_committee: "Placement Committee",
  super_admin: "Super Admin",
};

function buildVerificationLink(token: string, email: string): string {
  const url = new URL(`${APP_URL}/auth/verify`);
  url.searchParams.set("token_hash", token);
  url.searchParams.set("type", "signup");
  url.searchParams.set("email", email);
  return url.toString();
}

function buildEmailHtml(verifyUrl: string, role: UserRole): string {
  const roleLabel = ROLE_LABELS[role];
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your PlacementHub account</title>
</head>
<body style="margin:0;padding:0;background:#0A0F1E;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0F1E;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:linear-gradient(135deg,#131929 0%,#1a2340 100%);
                 border:1px solid rgba(99,102,241,0.3);
                 border-radius:16px;overflow:hidden;max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366F1,#8B5CF6);
                        padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.5px;">
                PlacementHub
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">
                ${roleLabel} Account Verification
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;color:#c8cfe8;">
              <h2 style="margin:0 0 16px;font-size:20px;color:#fff;font-weight:600;">
                Welcome aboard! 🎉
              </h2>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#a0aec0;">
                You've registered as a <strong style="color:#818CF8;">${roleLabel}</strong>.
                Click the button below to verify your email address and activate your account.
              </p>
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a href="${verifyUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);
                              color:#fff;font-size:16px;font-weight:600;
                              padding:14px 36px;border-radius:10px;
                              text-decoration:none;letter-spacing:0.3px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;color:#6366F1;word-break:break-all;">
                ${verifyUrl}
              </p>
              <hr style="border:none;border-top:1px solid rgba(99,102,241,0.15);margin:32px 0;"/>
              <p style="margin:0;font-size:12px;color:#4a5568;line-height:1.6;">
                This link expires in <strong>24 hours</strong>. If you didn't create a PlacementHub account,
                you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:rgba(0,0,0,0.3);
                        text-align:center;font-size:12px;color:#4a5568;">
              © ${new Date().getFullYear()} PlacementHub · Robonics InfoTech
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send a verification email via Resend.
 * @param to        Recipient email address
 * @param token     Supabase OTP token hash (from auth.signUp response)
 * @param role      User role for personalised copy
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
  role: UserRole
): Promise<void> {
  const verifyUrl = buildVerificationLink(token, to);
  const html = buildEmailHtml(verifyUrl, role);

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your PlacementHub account",
    html,
  });

  if (error) {
    console.error("[Resend] Failed to send verification email:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

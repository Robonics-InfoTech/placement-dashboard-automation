import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/* ─── Application Confirmation ──────────────────────────────────────── */
export async function sendApplicationConfirmation(
  to: string,
  job: { jobTitle: string; company: string; deadline: string | null },
  resumeName: string
): Promise<void> {
  const deadlineStr = job.deadline
    ? new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "No specific deadline";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Application Submitted — PlacementHub</title></head>
<body style="margin:0;padding:0;background:#0A0F1E;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0F1E;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:linear-gradient(135deg,#131929 0%,#1a2340 100%);
               border:1px solid rgba(99,102,241,0.25);border-radius:16px;overflow:hidden;max-width:560px;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366F1,#8B5CF6);padding:28px 40px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.3px;">PlacementHub</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Application Confirmation</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;color:#c8cfe8;">
            <div style="width:52px;height:52px;border-radius:14px;background:rgba(16,185,129,.15);
                        display:flex;align-items:center;justify-content:center;
                        font-size:24px;margin:0 auto 20px;text-align:center;line-height:52px;">✓</div>
            <h2 style="margin:0 0 14px;font-size:18px;color:#fff;font-weight:700;text-align:center;">
              Application Submitted!
            </h2>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#a0aec0;text-align:center;">
              Great news! Your application for <strong style="color:#818CF8;">${job.jobTitle}</strong>
              at <strong style="color:#818CF8;">${job.company}</strong> has been successfully submitted.
            </p>

            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
              <tr>
                <td style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);
                            border-radius:12px;padding:18px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:8px;">
                        Application Details
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#a0aec0;padding:4px 0;">
                        <strong style="color:#c8cfe8;">Role:</strong> ${job.jobTitle}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#a0aec0;padding:4px 0;">
                        <strong style="color:#c8cfe8;">Company:</strong> ${job.company}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#a0aec0;padding:4px 0;">
                        <strong style="color:#c8cfe8;">Resume submitted:</strong> ${resumeName}
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#a0aec0;padding:4px 0;">
                        <strong style="color:#c8cfe8;">Deadline:</strong> ${deadlineStr}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center" style="padding:4px 0 28px;">
                  <a href="${APP_URL}/student/applications"
                     style="display:inline-block;background:linear-gradient(135deg,#6366F1,#8B5CF6);
                            color:#fff;font-size:14px;font-weight:700;
                            padding:12px 32px;border-radius:10px;text-decoration:none;">
                    Track Application Status
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#4a5568;line-height:1.6;text-align:center;">
              We'll notify you when your application status changes. Good luck! 🤞
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 40px;background:rgba(0,0,0,0.3);text-align:center;font-size:11px;color:#4a5568;">
            © ${new Date().getFullYear()} PlacementHub · Robonics InfoTech
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Application Submitted: ${job.jobTitle} at ${job.company}`,
    html,
  });

  if (error) {
    console.error("[Resend] Application confirmation email failed:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

/* ─── Offer Notification ─────────────────────────────────────────────── */
export async function sendOfferNotification(
  to: string,
  offer: { company: string; role: string; packageLpa: number | null; joiningDate: string | null; action: "accepted" | "issued" }
): Promise<void> {
  const joiningStr = offer.joiningDate
    ? new Date(offer.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "To be confirmed";

  const isAccept = offer.action === "accepted";
  const subject  = isAccept
    ? `🎉 Offer Accepted — ${offer.role} at ${offer.company}`
    : `📬 New Offer: ${offer.role} at ${offer.company}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0A0F1E;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0F1E;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:linear-gradient(135deg,#131929 0%,#1a2340 100%);
               border:1px solid ${isAccept ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.25)"};
               border-radius:16px;overflow:hidden;max-width:560px;">
        <tr>
          <td style="background:${isAccept ? "linear-gradient(135deg,#059669,#10B981)" : "linear-gradient(135deg,#6366F1,#8B5CF6)"};
                     padding:28px 40px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;">PlacementHub</h1>
            <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.85);">
              ${isAccept ? "Offer Accepted — Congratulations!" : "New Offer Received"}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;color:#c8cfe8;">
            <div style="font-size:42px;text-align:center;margin-bottom:16px;">${isAccept ? "🎓🎉" : "🎁"}</div>
            <h2 style="margin:0 0 12px;font-size:20px;color:#fff;font-weight:800;text-align:center;">
              ${isAccept ? "You're Officially Placed!" : "You Have a New Offer!"}
            </h2>
            <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#a0aec0;text-align:center;">
              ${isAccept
                ? `Congratulations on accepting the offer from <strong style="color:#34D399;">${offer.company}</strong>. Your placement journey is complete!`
                : `<strong style="color:#818CF8;">${offer.company}</strong> has extended an offer for the role of <strong style="color:#818CF8;">${offer.role}</strong>.`}
            </p>

            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
              <tr>
                <td style="background:${isAccept ? "rgba(16,185,129,0.07)" : "rgba(99,102,241,0.08)"};
                            border:1px solid ${isAccept ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.15)"};
                            border-radius:12px;padding:20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr><td colspan="2" style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;padding-bottom:12px;">
                      Offer Details
                    </td></tr>
                    <tr>
                      <td style="font-size:13px;color:#a0aec0;padding:5px 0;"><strong style="color:#c8cfe8;">Company</strong></td>
                      <td style="font-size:13px;color:#a0aec0;padding:5px 0;text-align:right;">${offer.company}</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;color:#a0aec0;padding:5px 0;"><strong style="color:#c8cfe8;">Role</strong></td>
                      <td style="font-size:13px;color:#a0aec0;padding:5px 0;text-align:right;">${offer.role}</td>
                    </tr>
                    ${offer.packageLpa ? `
                    <tr>
                      <td style="font-size:13px;color:#a0aec0;padding:5px 0;"><strong style="color:#c8cfe8;">Package</strong></td>
                      <td style="font-size:20px;font-weight:800;color:${isAccept ? "#34D399" : "#818CF8"};padding:5px 0;text-align:right;">₹${offer.packageLpa} LPA</td>
                    </tr>` : ""}
                    <tr>
                      <td style="font-size:13px;color:#a0aec0;padding:5px 0;"><strong style="color:#c8cfe8;">Joining Date</strong></td>
                      <td style="font-size:13px;color:#a0aec0;padding:5px 0;text-align:right;">${joiningStr}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${!isAccept ? `
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center" style="padding:4px 0 28px;">
                  <a href="${APP_URL}/student/offers"
                     style="display:inline-block;background:linear-gradient(135deg,#10B981,#059669);
                            color:#fff;font-size:14px;font-weight:700;
                            padding:12px 32px;border-radius:10px;text-decoration:none;">
                    View & Respond to Offer
                  </a>
                </td>
              </tr>
            </table>` : ""}

            <p style="margin:0;font-size:12px;color:#4a5568;line-height:1.6;text-align:center;">
              ${isAccept ? "Best wishes for your new journey! 🚀" : "Please respond to the offer within the stipulated time frame."}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 40px;background:rgba(0,0,0,0.3);text-align:center;font-size:11px;color:#4a5568;">
            © ${new Date().getFullYear()} PlacementHub · Robonics InfoTech
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[Resend] Offer notification email failed:", error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

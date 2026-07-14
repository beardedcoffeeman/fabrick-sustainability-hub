import { Resend } from "resend";

// Internal ops notifications (new signups etc.). Same Resend constraints as
// the data-point-signup route: the free tier only delivers to the address that
// owns the Resend account (tom@fabrick.agency). Once fabrick.agency is
// verified as a sending domain, NOTIFY_FROM can move off the sandbox sender.
const NOTIFY_TO = "tom@fabrick.agency";
const NOTIFY_FROM = "onboarding@resend.dev";

/**
 * Send an internal notification email. Best-effort: catches its own errors so
 * a Resend hiccup never breaks the user-facing flow. Await it in serverless
 * handlers (fire-and-forget sends get clipped when the function is frozen).
 */
export async function sendOpsEmail(subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set - skipping ops notification");
    return;
  }
  try {
    const resend = new Resend(key);
    const result = await resend.emails.send({
      from: `Pulse Accounts <${NOTIFY_FROM}>`,
      to: NOTIFY_TO,
      subject,
      html,
    });
    if (result.error) console.error("Resend send error:", result.error);
  } catch (err) {
    console.error("sendOpsEmail threw:", err);
  }
}

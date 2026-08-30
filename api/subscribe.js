// Vercel serverless function — POST { email }
//
// Adds the address to a Resend Audience and sends a one time welcome
// email. The Resend key stays here on the server; the client only ever
// sees { ok: true } or a generic error.
//
// Env (Vercel dashboard): RESEND_API_KEY, RESEND_AUDIENCE_ID,
// NEWSLETTER_FROM, OWNER_EMAIL

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ISSUE_URL = "https://adamjemmali.me/madajbuilds/?w=1";

const resend = (path, body) =>
    fetch(`https://api.resend.com/${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify(body),
    });

const welcomeHtml = `
<div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px;line-height:1.6;color:#111">
  <p>You're on <b>The Build Log</b>.</p>
  <p>One email a week. What I built, what broke, what I actually learned. No filler.</p>
  <p>Issue no.1 lands in a moment. Each issue ends with a two minute quiz and one
     implementation plan, so you actually use the thing instead of just reading it.</p>
  <p>Start your streak here: <a href="${ISSUE_URL}">${ISSUE_URL}</a></p>
  <p style="color:#666">One click at the bottom of any issue removes you completely.</p>
  <p>Adam &middot; madaj.builds</p>
</div>`;

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ ok: false, error: "invalid_email" });
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID || !process.env.NEWSLETTER_FROM) {
        console.error("[subscribe] missing Resend env vars");
        return res.status(500).json({ ok: false, error: "not_configured" });
    }

    try {
        // Add to the audience. An "already a contact" response is fine.
        const add = await resend(`audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, {
            email,
            unsubscribed: false,
        });
        if (!add.ok && add.status !== 409) {
            const detail = await add.text().catch(() => "");
            console.error("[subscribe] audience add failed", add.status, detail);
            return res.status(502).json({ ok: false, error: "signup_failed" });
        }

        // Fire the welcome email. Don't fail the signup if this bounces.
        try {
            await resend("emails", {
                from: process.env.NEWSLETTER_FROM,
                to: email,
                subject: "You're on The Build Log",
                html: welcomeHtml,
            });
        } catch (err) {
            console.error("[subscribe] welcome email failed", err);
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[subscribe] unexpected", err);
        return res.status(500).json({ ok: false, error: "server_error" });
    }
}

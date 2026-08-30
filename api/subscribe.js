// Vercel serverless function — POST { email }
//
// Adds the address to a Resend Audience and sends a one time welcome
// email. The Resend key stays here on the server; the client only ever
// sees { ok: true } or a generic error.
//
// Env (Vercel dashboard): RESEND_API_KEY, RESEND_AUDIENCE_ID,
// RESEND_TOPIC_ID, NEWSLETTER_FROM, OWNER_EMAIL

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
<div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px;line-height:1.7;color:#111;max-width:560px">
  <p style="color:#666;margin:0 0 4px">THE BUILD LOG &middot; Issue no.1</p>
  <h1 style="font-size:19px;margin:0 0 20px;line-height:1.35">Two sites, one day, plenty of wreckage</h1>

  <p>You're in. One email a week: what I built, what broke, what I actually learned. No filler.</p>

  <p>This week I shipped two sites in one day &mdash; this portfolio and the madajbuilds
     OS &mdash; and picked up three things worth keeping.</p>

  <p><b>1. Rotate first, calculate never.</b><br/>
     Pasted a key somewhere it might have sat exposed for about four minutes. Rotating
     it took ninety seconds. The moment you start doing the math on whether it's
     "probably fine," you already have your answer &mdash; rotate it.</p>

  <p><b>2. Check what paints last.</b><br/>
     Build worked locally, visitors got a blank screen. Framework was fine. A full
     bleed overlay was sitting on top of everything from frame one. If a page looks
     dead, look at what's covering it before you look at what's broken.</p>

  <p><b>3. Build the 40 second thing nobody asked for.</b><br/>
     Jumping between the two sites didn't need anything. I built it anyway &mdash; a
     fake "Time Travel Engaged" warp sequence, 1.21 gigawatts and all, before it
     redirects. Nobody asked for it. That's exactly why people remember it.</p>

  <p>Every issue ends with a two minute quiz and one implementation plan, so you
     actually use it instead of just reading it. This week's plan: one thing you've
     been putting off &mdash; name it, and the day you start.</p>

  <p><a href="${ISSUE_URL}" style="color:#111">Take the quiz &amp; lock in your plan &rarr;</a></p>

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

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_TOPIC_ID || !process.env.NEWSLETTER_FROM) {
        console.error("[subscribe] missing Resend env vars");
        return res.status(500).json({ ok: false, error: "not_configured" });
    }

    try {
        // Add the contact and opt them into The Build Log topic.
        // An "already a contact" response (409) is fine.
        const add = await resend("contacts", {
            email,
            unsubscribed: false,
            topics: process.env.RESEND_TOPIC_ID
                ? [{ id: process.env.RESEND_TOPIC_ID, subscription: "opt_in" }]
                : undefined,
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
                subject: "The Build Log #1: Two sites, one day, plenty of wreckage",
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

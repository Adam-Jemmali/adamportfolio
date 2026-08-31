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

// Hosted avatar — same pfp used site-wide, matches --pfp-grad (cyan → blue
// → brown) defined in src/index.css. Email clients can't load local/relative
// assets, so this has to be the live absolute URL.
const AVATAR_URL = "https://adamjemmali.me/public/pfp.png";

// Full HTML document, not a fragment: table layout + inline styles for
// client compatibility (Outlook/Gmail strip most flexbox/grid), a couple
// of <style>-only touches (blinking cursor, CTA glow) that degrade to
// static in clients that ignore <style>, and no reliance on web fonts —
// the monospace stack falls back cleanly everywhere.
const welcomeHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="dark" />
<meta name="supported-color-schemes" content="dark" />
<title>The Build Log #1</title>
<style>
  body,table,td{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  img{border:0;outline:none;text-decoration:none}
  a{text-decoration:none}
  @media (max-width:600px){
    .container{width:100% !important}
    .px{padding-left:20px !important;padding-right:20px !important}
  }
  @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  .cursor{animation:blink 1s steps(1) infinite}
  @keyframes pulseGlow{
    0%,100%{box-shadow:0 0 0 0 rgba(74,216,237,0)}
    50%{box-shadow:0 0 24px 3px rgba(74,216,237,0.45)}
  }
  .cta-btn{animation:pulseGlow 2.6s ease-in-out infinite}
</style>
</head>
<body style="margin:0;padding:0;background:#05060a">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Issue no.1 — rotate the key, check what's painting on top, and the 40 second thing nobody asked for.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05060a">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#0d0f16;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden">

<tr><td style="padding:14px 20px;background:#0a0b10;border-bottom:1px solid rgba(255,255,255,0.06)">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="width:54px">
<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#fb7185;margin-right:6px"></span>
<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#fbbf24;margin-right:6px"></span>
<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22d3ee"></span>
</td>
<td align="right" style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#5a5d6b">buildlog@adamjemmali.me &mdash; issue_01.log</td>
</tr></table>
</td></tr>

<tr><td class="px" style="padding:28px 32px 0 32px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:52px">
<img src="${AVATAR_URL}" width="48" height="48" alt="Adam" style="display:block;border-radius:50%;border:2px solid #22d3ee" />
</td>
<td style="padding-left:12px;font-family:ui-monospace,Menlo,Consolas,monospace">
<div style="color:#22d3ee;font-size:12px;letter-spacing:.08em">THE BUILD LOG <span class="cursor">_</span></div>
<div style="color:#5a5d6b;font-size:12px">Issue no.1</div>
</td>
</tr></table>
</td></tr>

<tr><td class="px" style="padding:18px 32px 4px 32px">
<h1 style="margin:0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:24px;line-height:1.3;color:#f5f5f7">Two sites, one day,<br/>plenty of wreckage</h1>
</td></tr>

<tr><td class="px" style="padding:14px 32px 0 32px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px;line-height:1.7;color:#c7c9d4">
You're in. One email a week: what I built, what broke, what I actually learned. No filler.
</td></tr>

<tr><td class="px" style="padding:10px 32px 0 32px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:15px;line-height:1.7;color:#c7c9d4">
This week I shipped two sites in one day &mdash; this portfolio and the madajbuilds OS &mdash; and picked up three things worth keeping.
</td></tr>

<tr><td class="px" style="padding:22px 32px 0 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:0 0 14px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12141c;border:1px solid rgba(255,255,255,0.07);border-left:3px solid #5b6cff;border-radius:10px">
<tr><td style="padding:16px 18px;font-family:ui-monospace,Menlo,Consolas,monospace">
<div style="font-size:13px;color:#5b6cff;margin-bottom:6px">🔑&nbsp; 01 &middot; ROTATE FIRST, CALCULATE NEVER</div>
<div style="font-size:14px;line-height:1.65;color:#c7c9d4">Pasted a key somewhere it might have sat exposed for about four minutes. Rotating it took ninety seconds. The moment you start doing the math on whether it's "probably fine," you already have your answer.</div>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:0 0 14px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12141c;border:1px solid rgba(255,255,255,0.07);border-left:3px solid #22d3ee;border-radius:10px">
<tr><td style="padding:16px 18px;font-family:ui-monospace,Menlo,Consolas,monospace">
<div style="font-size:13px;color:#22d3ee;margin-bottom:6px">👀&nbsp; 02 &middot; CHECK WHAT PAINTS LAST</div>
<div style="font-size:14px;line-height:1.65;color:#c7c9d4">Build worked locally, visitors got a blank screen. Framework was fine &mdash; a full bleed overlay was sitting on top of everything from frame one. If a page looks dead, check what's covering it before you check what's broken.</div>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12141c;border:1px solid rgba(255,255,255,0.07);border-left:3px solid #fbbf24;border-radius:10px">
<tr><td style="padding:16px 18px;font-family:ui-monospace,Menlo,Consolas,monospace">
<div style="font-size:13px;color:#fbbf24;margin-bottom:6px">🚀&nbsp; 03 &middot; BUILD THE 40 SECOND THING NOBODY ASKED FOR</div>
<div style="font-size:14px;line-height:1.65;color:#c7c9d4">Jumping between the two sites didn't need anything. I built it anyway &mdash; a fake "Time Travel Engaged" warp sequence, 1.21 gigawatts and all, before it redirects. Nobody asked for it. That's exactly why people remember it.</div>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>

<tr><td class="px" style="padding:24px 32px 0 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12141c;border:1px dashed rgba(74,216,237,0.35);border-radius:12px">
<tr><td style="padding:18px 20px;font-family:ui-monospace,Menlo,Consolas,monospace">
<div style="font-size:13px;color:#9a9aa5;margin-bottom:8px">⏱&nbsp; TWO MINUTE QUIZ &middot; ● ● ●</div>
<div style="font-size:15px;color:#f5f5f7;margin-bottom:4px">This week's plan:</div>
<div style="font-size:14px;color:#c7c9d4;line-height:1.6">One thing you've been putting off. Name it, and the day you start.</div>
</td></tr>
</table>
</td></tr>

<tr><td align="center" style="padding:26px 32px 6px 32px">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td class="cta-btn" style="border-radius:999px;background:linear-gradient(135deg,#4ad8ed 0%,#3aa7ce 45%,#5b6cff 100%)">
<a href="${ISSUE_URL}" style="display:inline-block;padding:14px 28px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;font-weight:700;color:#05060a;border-radius:999px">Take the quiz &amp; lock in your plan &rarr;</a>
</td></tr></table>
</td></tr>

<tr><td class="px" style="padding:26px 32px 28px 32px;border-top:1px solid rgba(255,255,255,0.06)">
<div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#5a5d6b;line-height:1.7">
One click at the bottom of any issue removes you completely.<br/>
Adam &middot; <a href="https://adamjemmali.me" style="color:#5a5d6b">madaj.builds</a>
</div>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

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

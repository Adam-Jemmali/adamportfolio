// Vercel serverless function — POST { email?, week }
//
// A privacy safe completion ping: it records that *someone* finished a
// week's quiz + implementation plan, nothing about their answers. Adam
// reads the counts from Vercel > Observability > Logs (filter for
// "quiz-complete").
//
// Upgrade path for a real dashboard number (~10 lines): add @vercel/kv
// and `await kv.incr(\`buildlog:week:\${week}\`)` here.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    const week = Number(req.body?.week);
    if (!Number.isInteger(week) || week < 1 || week > 999) {
        return res.status(400).json({ ok: false, error: "invalid_week" });
    }

    const rawEmail = String(req.body?.email || "").trim().toLowerCase();
    const email = EMAIL_RE.test(rawEmail) ? rawEmail : null;

    console.log(JSON.stringify({ tag: "quiz-complete", week, email, at: Date.now() }));
    return res.status(200).json({ ok: true });
}

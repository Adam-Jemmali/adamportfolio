import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CtaSignup() {
    const [email, setEmail] = useState("");
    const [state, setState] = useState("idle"); // idle | sending | done | error
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        const clean = email.trim().toLowerCase();
        if (!EMAIL_RE.test(clean)) {
            setError("Enter a real email.");
            setState("error");
            return;
        }
        setError("");
        setState("sending");
        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: clean }),
            });
            if (!res.ok) throw new Error(String(res.status));
            try { localStorage.setItem("mb.buildlog.email", clean); } catch { /* ignore */ }
            setState("done");
        } catch {
            // No functions in `vite dev`, or a real failure — soft fallback.
            setError("Signups open in production. For now, email adam.official.514@gmail.com");
            setState("error");
        }
    };

    if (state === "done") {
        return (
            <div className="cta-signup cta-signup-done">
                <p className="eyebrow">THE BUILD LOG</p>
                <p className="cta-signup-msg">
                    You&apos;re in. Issue no.1 is on its way to <b>{email.trim().toLowerCase()}</b>.
                </p>
            </div>
        );
    }

    return (
        <div className="cta-signup">
            <p className="eyebrow">THE BUILD LOG</p>
            <p className="cta-signup-sub">
                One email a week. What I built, what broke, what I actually learned.
                Two minute quiz at the end so you use it. One click to leave.
            </p>
            <form className="cta-signup-form" onSubmit={submit}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                    placeholder="you@email.com"
                    aria-label="Email address"
                    autoComplete="email"
                />
                <button type="submit" disabled={state === "sending"}>
                    {state === "sending" ? "Joining…" : "Join"}
                    <span aria-hidden="true"> →</span>
                </button>
            </form>
            {state === "error" && <p className="cta-signup-err">{error}</p>}
        </div>
    );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { getWeek } from "./weeks.js";

const STORE = "mb.buildlog";

const readLog = () => {
    try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; }
};
const writeLog = (log) => {
    try { localStorage.setItem(STORE, JSON.stringify(log)); } catch { /* ignore */ }
};

/**
 * Interactive version of an issue's quiz + implementation plan, opened by
 * /madajbuilds/?w=<n>. Modal overlay; everything stays on the reader's
 * device except a privacy safe { email?, week } completion ping.
 */
export default function ClimbQuiz({ week, onClose }) {
    const data = useMemo(() => getWeek(week), [week]);
    const [step, setStep] = useState(0);        // 0..questions.length-1, then "plan", then "done"
    const [picked, setPicked] = useState(null); // index picked for the current question
    const [answers, setAnswers] = useState([]);
    const [plan, setPlan] = useState("");
    const [by, setBy] = useState("");
    const [streak, setStreak] = useState(0);
    const closeRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    if (!data) return null;

    const total = data.questions.length;
    const onPlan = step === total;
    const onDone = step === total + 1;
    const q = data.questions[step];

    const nextQuestion = () => {
        setAnswers((a) => [...a, picked]);
        setPicked(null);
        setStep((s) => s + 1);
    };

    const finish = () => {
        const entry = {
            week: data.n,
            plan: plan.trim(),
            by,
            correct: answers.filter((a, i) => a === data.questions[i].correct).length,
            total,
            doneAt: Date.now(),
        };
        const log = readLog().filter((e) => e.week !== data.n).concat(entry);
        writeLog(log);
        setStreak(log.length);

        let email;
        try { email = localStorage.getItem("mb.buildlog.email") || undefined; } catch { /* ignore */ }
        fetch("/api/quiz-complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, week: data.n }),
        }).catch(() => { /* fire and forget */ });

        setStep(total + 1);
    };

    const progress = onDone ? 1 : (step + (picked != null || onPlan ? 1 : 0)) / (total + 1);

    return (
        <div className="climb-quiz-backdrop" role="dialog" aria-modal="true" aria-label="The Build Log quiz" onClick={onClose}>
            <div className="climb-quiz" onClick={(e) => e.stopPropagation()}>
                <div className="climb-quiz-top">
                    <span className="climb-quiz-issue mono">THE BUILD LOG · NO.{String(data.n).padStart(2, "0")}</span>
                    <button ref={closeRef} type="button" className="climb-quiz-x" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="climb-quiz-track"><div className="climb-quiz-fill" style={{ width: `${progress * 100}%` }} /></div>

                {!onPlan && !onDone && (
                    <div className="climb-quiz-body">
                        <p className="climb-quiz-step mono">Question {step + 1} / {total}</p>
                        <h3 className="climb-quiz-q">{q.q}</h3>
                        <div className="climb-quiz-options">
                            {q.options.map((opt, i) => {
                                const chosen = picked === i;
                                const reveal = picked != null;
                                const right = i === q.correct;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        className={`climb-quiz-option${chosen ? " is-chosen" : ""}${reveal && right ? " is-right" : ""}${reveal && chosen && !right ? " is-wrong" : ""}`}
                                        onClick={() => picked == null && setPicked(i)}
                                        disabled={reveal}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                        {picked != null && (
                            <>
                                <p className="climb-quiz-why">{q.why}</p>
                                <button type="button" className="climb-quiz-next" onClick={nextQuestion}>
                                    {step + 1 < total ? "Next" : "Your plan"} <span aria-hidden="true">→</span>
                                </button>
                            </>
                        )}
                    </div>
                )}

                {onPlan && (
                    <div className="climb-quiz-body">
                        <p className="climb-quiz-step mono">Implementation plan</p>
                        <h3 className="climb-quiz-q">{data.planPrompt}</h3>
                        <label className="climb-quiz-label">
                            One thing you will do this week
                            <input type="text" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="I will…" />
                        </label>
                        <label className="climb-quiz-label">
                            By when
                            <input type="date" value={by} onChange={(e) => setBy(e.target.value)} />
                        </label>
                        <button type="button" className="climb-quiz-next" onClick={finish} disabled={!plan.trim()}>
                            Lock it in <span aria-hidden="true">→</span>
                        </button>
                    </div>
                )}

                {onDone && (
                    <div className="climb-quiz-body climb-quiz-done">
                        <h3 className="climb-quiz-q">You are on a {streak} week streak.</h3>
                        <p className="climb-quiz-plan-echo">
                            {plan.trim()}{by ? ` by ${by}` : ""}
                        </p>
                        <p className="climb-quiz-why">
                            Saved to this browser. Do it, then come back next issue.
                        </p>
                        <button type="button" className="climb-quiz-next" onClick={onClose}>Close</button>
                    </div>
                )}
            </div>
        </div>
    );
}

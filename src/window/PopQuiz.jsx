import { useEffect, useRef, useState } from "react";
import { Brain, Play, RotateCcw, Timer, Zap } from "lucide-react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { QUIZ_CATEGORIES, quizPool, shuffleDeck } from "#game/popquiz.js";

const TIME_PER_QUESTION = 20;

const readHigh = () => {
    try {
        return Number(localStorage.getItem("mj-popquiz-high")) || 0;
    } catch {
        return 0;
    }
};

const PopQuiz = () => {
    const [phase, setPhase] = useState("setup"); // "setup" | "playing" | "done"
    const [category, setCategory] = useState("all");
    const [timed, setTimed] = useState(false);

    const [deck, setDeck] = useState([]);
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState(null); // null | -1 (timed out) | option index
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [high, setHigh] = useState(readHigh);
    const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
    const [lastGain, setLastGain] = useState(0);
    const timeLeftRef = useRef(TIME_PER_QUESTION);

    const question = deck[index];
    const answered = picked !== null;
    const timedOut = picked === -1;
    const correct = answered && picked === question?.answer;

    const categoryLabel =
        category === "all"
            ? "all topics"
            : QUIZ_CATEGORIES.find((c) => c.id === category)?.label ?? "dev quiz";

    const computePoints = () => {
        if (!timed) return 10;
        const ratio = Math.max(0, timeLeft / TIME_PER_QUESTION);
        return Math.max(5, Math.round(100 * ratio));
    };

    const feedbackText = () => {
        if (timedOut) return `Time's up — it was “${question.options[question.answer]}”.`;
        if (correct) {
            if (timed) return `Correct! +${lastGain} pts.`;
            return streak + 1 > 1 ? `Correct! ${streak + 1} in a row.` : "Correct! Nice one.";
        }
        return `Nope — it was “${question.options[question.answer]}”.`;
    };

    const startGame = () => {
        setDeck(shuffleDeck(quizPool(category)));
        setIndex(0);
        setPicked(null);
        setScore(0);
        setCorrectCount(0);
        setStreak(0);
        setBestStreak(0);
        timeLeftRef.current = TIME_PER_QUESTION;
        setTimeLeft(TIME_PER_QUESTION);
        setLastGain(0);
        setPhase("playing");
    };

    const backToSetup = () => {
        setPhase("setup");
        setPicked(null);
    };

    const pick = (i) => {
        if (answered) return;
        setPicked(i);

        const isCorrect = i === question.answer;
        const points = isCorrect ? computePoints() : 0;

        if (isCorrect) {
            setCorrectCount((c) => c + 1);
            setScore((s) => s + points);
            setLastGain(points);
            setStreak((s) => {
                const nextStreak = s + 1;
                setBestStreak((b) => Math.max(b, nextStreak));
                return nextStreak;
            });
            const newScore = score + points;
            setHigh((prev) => {
                const best = Math.max(prev, newScore);
                try {
                    localStorage.setItem("mj-popquiz-high", String(best));
                } catch {
                    // Storage unavailable — the high score just won't persist.
                }
                return best;
            });
        } else {
            setStreak(0);
            setLastGain(0);
        }
    };

    // Timed-mode countdown. Reaching zero counts as a miss. The interval
    // callback (not the effect body) drives state updates.
    useEffect(() => {
        if (phase !== "playing" || !timed || answered) return;

        const id = setInterval(() => {
            timeLeftRef.current -= 1;
            if (timeLeftRef.current <= 0) {
                timeLeftRef.current = 0;
                clearInterval(id);
                setTimeLeft(0);
                setPicked(-1);
                setStreak(0);
                setLastGain(0);
            } else {
                setTimeLeft(timeLeftRef.current);
            }
        }, 1000);

        return () => clearInterval(id);
    }, [phase, timed, answered, index]);

    const nextQuestion = () => {
        if (index + 1 >= deck.length) {
            setPhase("done");
            return;
        }
        setIndex((i) => i + 1);
        setPicked(null);
        timeLeftRef.current = TIME_PER_QUESTION;
        setTimeLeft(TIME_PER_QUESTION);
        setLastGain(0);
    };

    return (
        <>
            <div id="window-header">
                <WindowsControls target="popquiz" />
                <h2>Dev Quiz</h2>
            </div>

            {phase === "setup" && (
                <div className="popquiz-body popquiz-setup">
                    <div className="popquiz-setup-head">
                        <span className="popquiz-badge"><Brain size={13} /> dev quiz</span>
                        <h3 className="popquiz-prompt">Pick a category</h3>
                        <p className="popquiz-setup-sub">
                            Coding, full stack, system design and web questions.
                        </p>
                    </div>

                    <div className="popquiz-categories">
                        <button
                            type="button"
                            className={`popquiz-category ${category === "all" ? "active" : ""}`}
                            onClick={() => setCategory("all")}
                        >
                            All topics
                        </button>
                        {QUIZ_CATEGORIES.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                className={`popquiz-category ${category === c.id ? "active" : ""}`}
                                onClick={() => setCategory(c.id)}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    <label className="popquiz-timed">
                        <input
                            type="checkbox"
                            checked={timed}
                            onChange={(e) => setTimed(e.target.checked)}
                        />
                        <span className="popquiz-timed-box">
                            <Zap size={13} />
                        </span>
                        <span className="popquiz-timed-copy">
                            <b>Timed mode</b>
                            <span>{TIME_PER_QUESTION}s per question — answer faster to score more.</span>
                        </span>
                    </label>

                    <button type="button" className="popquiz-next" onClick={startGame}>
                        <Play size={15} />
                        Start quiz
                    </button>
                </div>
            )}

            {phase === "playing" && question && (
                <div className="popquiz-body">
                    <div className="popquiz-stats">
                        <span>score <b>{score}</b></span>
                        <span>high <b>{high}</b></span>
                        <span>streak <b>{streak}</b></span>
                        <button type="button" className="popquiz-restart" onClick={backToSetup}>
                            Change category
                        </button>
                    </div>

                    {timed && (
                        <div className="popquiz-timer">
                            <span className="popquiz-timer-label">
                                <Timer size={13} />
                                {timeLeft}s
                            </span>
                            <span className="popquiz-timer-track">
                                <span
                                    className={`popquiz-timer-bar ${timeLeft <= 5 ? "low" : ""}`}
                                    style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
                                />
                            </span>
                        </div>
                    )}

                    <div className="popquiz-card">
                        <span className="popquiz-badge"><Brain size={13} /> {categoryLabel}</span>
                        <h3 className="popquiz-prompt">{question.question}</h3>

                        <div className="popquiz-options">
                            {question.options.map((option, i) => {
                                const isAnswer = answered && i === question.answer;
                                const isPickedWrong = answered && i === picked && i !== question.answer;
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`popquiz-option ${isAnswer ? "is-correct" : ""} ${isPickedWrong ? "is-wrong" : ""}`}
                                        onClick={() => pick(i)}
                                        disabled={answered}
                                    >
                                        <span className="popquiz-letter">{String.fromCharCode(65 + i)}</span>
                                        <span>{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {answered && (
                            <div className={`popquiz-feedback ${correct ? "is-correct" : "is-wrong"}`}>
                                {feedbackText()}
                            </div>
                        )}
                    </div>

                    <button type="button" className="popquiz-next" onClick={nextQuestion} disabled={!answered}>
                        {answered ? (index + 1 >= deck.length ? "See results" : "Next question") : "Pick an answer"}
                    </button>
                </div>
            )}

            {phase === "done" && (
                <div className="popquiz-body popquiz-results">
                    <span className="popquiz-results-icon"><Brain size={28} /></span>
                    <h3 className="popquiz-prompt">Quiz complete!</h3>
                    <p className="popquiz-results-score">
                        You scored <b>{score}</b> points
                    </p>
                    <p className="popquiz-results-sub">
                        {correctCount} of {deck.length} correct
                        {bestStreak > 1 ? ` · best streak ${bestStreak}` : ""}
                        {score >= high && score > 0 ? " · new high!" : ""}
                    </p>
                    <div className="popquiz-results-actions">
                        <button type="button" className="popquiz-next ghost" onClick={backToSetup}>
                            <RotateCcw size={15} />
                            Change category
                        </button>
                        <button type="button" className="popquiz-next" onClick={startGame}>
                            <Play size={15} />
                            Play again
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const PopQuizWindow = WindowWrapper(PopQuiz, "popquiz");
export default PopQuizWindow;

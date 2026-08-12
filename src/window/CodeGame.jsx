import { useEffect, useRef, useState } from "react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

const GAME_TIME = 60;

// Hand-written snippets — real syntax, one plain-language tip each.
const SNIPPETS = [
    { code: 'print("hello, world")', lang: "Python", tip: "Prints text to the terminal." },
    { code: "const answer = 42;", lang: "JavaScript", tip: "Declares a constant number." },
    { code: "def add(a, b): return a + b", lang: "Python", tip: "A function that adds two numbers." },
    { code: "SELECT * FROM users;", lang: "SQL", tip: "Fetches every row from the users table." },
    { code: 'git commit -m "init"', lang: "Shell", tip: "Saves a snapshot of your changes." },
    { code: "for (let i = 0; i < 5; i++) {", lang: "JavaScript", tip: "A loop that runs 5 times." },
    { code: 'if score > 10: print("win")', lang: "Python", tip: "Runs code only when a condition is true." },
    { code: "npm install react", lang: "Shell", tip: "Adds the React package to your project." },
    { code: "const doubled = nums.map(n => n * 2);", lang: "JavaScript", tip: "Maps each array item to its double." },
    { code: "export default function App() {}", lang: "JavaScript", tip: "Exports a React component." },
    { code: "docker build -t myapp .", lang: "Shell", tip: "Builds a Docker image named myapp." },
    { code: "body { margin: 0; padding: 0; }", lang: "CSS", tip: "Removes default page spacing." },
];

const CodeGame = () => {
    const [phase, setPhase] = useState("ready"); // ready | playing | over
    const [snippetIdx, setSnippetIdx] = useState(0);
    const [typed, setTyped] = useState("");
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [correctKeys, setCorrectKeys] = useState(0);
    const [totalKeys, setTotalKeys] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [high, setHigh] = useState(() => Number(localStorage.getItem("mj-code-high")) || 0);

    const inputRef = useRef(null);
    const snippet = SNIPPETS[snippetIdx % SNIPPETS.length];

    const start = () => {
        setPhase("playing");
        setSnippetIdx(0);
        setTyped("");
        setScore(0);
        setCompleted(0);
        setCorrectKeys(0);
        setTotalKeys(0);
        setTimeLeft(GAME_TIME);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    // Countdown.
    useEffect(() => {
        if (phase !== "playing") return;
        const id = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(id);
                    setPhase("over");
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    // Persist high score at game over.
    useEffect(() => {
        if (phase === "over") {
            setHigh((prev) => {
                const best = Math.max(prev, score);
                localStorage.setItem("mj-code-high", String(best));
                return best;
            });
        }
    }, [phase, score]);

    const handleChange = (e) => {
        if (phase !== "playing") return;
        const val = e.target.value;
        const code = snippet.code;
        if (val.length > code.length) return; // ignore overshoot

        // Count newly typed characters only (ignore backspaces).
        if (val.length > typed.length) {
            let correct = 0;
            for (let i = typed.length; i < val.length; i++) {
                if (val[i] === code[i]) correct++;
            }
            setTotalKeys((t) => t + (val.length - typed.length));
            setCorrectKeys((c) => c + correct);
        }

        setTyped(val);

        if (val === code) {
            setScore((s) => s + 10 + code.length);
            setCompleted((c) => c + 1);
            setTyped("");
            setSnippetIdx((i) => i + 1);
        }
    };

    const accuracy = totalKeys ? Math.round((correctKeys / totalKeys) * 100) : 100;
    const wpm = Math.round(correctKeys / 5);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="code" />
                <h2>Code Racer — learn by typing</h2>
            </div>

            <div className="code-body">
                {phase === "playing" ? (
                    <>
                        <div className="code-hud">
                            <span>time <b>{timeLeft}s</b></span>
                            <span>score <b>{score}</b></span>
                            <span>done <b>{completed}</b></span>
                            <span>acc <b>{accuracy}%</b></span>
                        </div>

                        <div className="code-snippet" aria-label={`Type this ${snippet.lang} code`}>
                            <span className="c-lang">{snippet.lang}</span>
                            {[...snippet.code].map((ch, i) => {
                                const cls = i < typed.length
                                    ? (typed[i] === ch ? "c-ok" : "c-err")
                                    : "c-idle";
                                return (
                                    <span key={i} className={cls}>
                                        {ch === " " ? "\u00A0" : ch}
                                    </span>
                                );
                            })}
                        </div>

                        <input
                            ref={inputRef}
                            className="code-input"
                            value={typed}
                            onChange={handleChange}
                            autoFocus
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            aria-label="Type the code"
                        />

                        <div className="code-tip">
                            <b>{snippet.lang} ·</b> {snippet.tip}
                        </div>
                    </>
                ) : (
                    <div className="code-overlay" style={{ flex: 1 }}>
                        <h3>{phase === "over" ? "Time's up!" : "Code Racer"}</h3>
                        <p>
                            {phase === "over"
                                ? `You completed ${completed} snippet${completed === 1 ? "" : "s"} · ${wpm} wpm · ${accuracy}% accuracy.`
                                : "Type the code exactly as shown for 60 seconds. Learn a real trick with every line you finish."}
                        </p>
                        {phase === "over" && <p className="!text-cyan-300">high score: {high}</p>}
                        <button type="button" className="code-start" onClick={start}>
                            {phase === "over" ? "Race again" : "Start"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

const CodeGameWindow = WindowWrapper(CodeGame, "code");
export default CodeGameWindow;

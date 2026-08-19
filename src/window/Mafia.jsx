import { useEffect, useMemo, useRef, useState } from "react";
import WindowsControls from "#components/WindowsControls.jsx";
import { MafiaCat } from "#components/AppMascots.jsx";
import { MafiaBustedScene, MafiaReadyScene } from "#components/MafiaBusted.jsx";
import {
    MagnifierIcon,
    BustedIcon,
    StreakIcon,
    ReplayIcon,
    RoundsIcon,
    BugIcon,
    PythonIcon,
    JavaIcon,
    TypeScriptIcon,
    GoIcon,
    CppIcon,
} from "#components/MafiaIcons.jsx";
import { EasyIcon, NormalIcon, HardIcon, AllIcon } from "#components/GameIcons.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { readHighScore, recordHighScore, recordGameResult } from "#game/highscores.js";
import { playClick, playWhoosh } from "#utils/sound.js";

const HIGH_KEY = "mj-mafia-high";

const MAFIA_DIFFICULTIES = [
    { id: "easy", label: "Easy", tagline: "Obvious bugs", Icon: EasyIcon, rounds: 4, base: 100, streakBonus: 20, timer: 0 },
    { id: "normal", label: "Normal", tagline: "Interview bugs", Icon: NormalIcon, rounds: 5, base: 120, streakBonus: 25, timer: 0 },
    { id: "hard", label: "Hard", tagline: "Subtle, timed", Icon: HardIcon, rounds: 6, base: 150, streakBonus: 40, timer: 20 },
];

const MAFIA_LANGS = [
    { id: "all", label: "All", Icon: AllIcon },
    { id: "Python", label: "Python", Icon: PythonIcon },
    { id: "Java", label: "Java", Icon: JavaIcon },
    { id: "TypeScript", label: "TypeScript", Icon: TypeScriptIcon },
    { id: "Go", label: "Go", Icon: GoIcon },
    { id: "C++", label: "C++", Icon: CppIcon },
];

const LANG_ICONS = { Python: PythonIcon, Java: JavaIcon, TypeScript: TypeScriptIcon, Go: GoIcon, "C++": CppIcon };

// FAANG / internship style reading-and-debugging questions. One imposter line
// per snippet, split evenly across Python, Java, TypeScript, Go, and C++.
const QUESTIONS = [
    // ── Python ─────────────────────────────────────────────────────────
    {
        lang: "Python",
        difficulty: "easy",
        title: "Return the first letter of a word.",
        lines: [
            "def first_letter(word):",
            "    return word[1]",
        ],
        imposterLine: 2,
        explanation: "Python is zero-indexed, so word[1] is the second character. The first character is word[0].",
        fix: "return word[0]",
    },
    {
        lang: "Python",
        difficulty: "normal",
        title: "Build a shopping cart.",
        lines: [
            "def add_item(item, cart=[]):",
            "    cart.append(item)",
            "    return cart",
        ],
        imposterLine: 1,
        explanation: "The default cart=[] is created once and shared across every call, so items leak between calls. Use None and create the list inside.",
        fix: "def add_item(item, cart=None):\n    cart = cart or []",
    },
    {
        lang: "Python",
        difficulty: "normal",
        title: "Greet the admin by name.",
        lines: [
            "if name is 'Ada':",
            "    greet(name)",
        ],
        imposterLine: 1,
        explanation: "`is` checks identity, not value. Two equal strings can be different objects, so this misses valid matches. Use ==.",
        fix: "if name == 'Ada':",
    },
    {
        lang: "Python",
        difficulty: "hard",
        title: "Capture the loop index.",
        lines: [
            "funcs = []",
            "for i in range(3):",
            "    funcs.append(lambda: i)",
            "print([f() for f in funcs])",
        ],
        imposterLine: 3,
        explanation: "Each lambda closes over the same variable i, so after the loop every function returns the last value. Bind the current value explicitly.",
        fix: "funcs.append(lambda i=i: i)",
    },

    // ── Java ───────────────────────────────────────────────────────────
    {
        lang: "Java",
        difficulty: "easy",
        title: "Print every element.",
        lines: [
            "for (int i = 0; i <= arr.length; i++) {",
            "    System.out.println(arr[i]);",
            "}",
        ],
        imposterLine: 1,
        explanation: "Off-by-one: `<=` walks one index past the last element and throws ArrayIndexOutOfBoundsException. The guard must be strict `<`.",
        fix: "for (int i = 0; i < arr.length; i++)",
    },
    {
        lang: "Java",
        difficulty: "normal",
        title: "Allow only the admin.",
        lines: [
            "if (name == \"admin\") {",
            "    grantAccess();",
            "}",
        ],
        imposterLine: 1,
        explanation: "`==` compares references, not the characters inside the strings. Two different String objects with the same text fail this check. Use equals().",
        fix: "if (\"admin\".equals(name))",
    },
    {
        lang: "Java",
        difficulty: "normal",
        title: "Remove matching items.",
        lines: [
            "for (String s : list) {",
            "    if (s.equals(\"x\")) list.remove(s);",
            "}",
        ],
        imposterLine: 2,
        explanation: "Removing while iterating with an enhanced for loop invalidates the iterator and throws ConcurrentModificationException. Use an explicit Iterator.",
        fix: "Iterator<String> it = list.iterator(); while (it.hasNext()) { if (it.next().equals(\"x\")) it.remove(); }",
    },
    {
        lang: "Java",
        difficulty: "hard",
        title: "Count safely across threads.",
        lines: [
            "class Counter {",
            "    int count = 0;",
            "    void increment() {",
            "        count++;",
            "    }",
            "}",
        ],
        imposterLine: 4,
        explanation: "`count++` is read-modify-write, not atomic. Concurrent threads can lose increments. Use AtomicInteger or synchronize.",
        fix: "AtomicInteger count = new AtomicInteger();\ncount.incrementAndGet();",
    },

    // ── TypeScript ─────────────────────────────────────────────────────
    {
        lang: "TypeScript",
        difficulty: "easy",
        title: "Promote a user to admin.",
        lines: [
            "function login(user) {",
            "  if (user.role = 'admin') {",
            "    grantAccess();",
            "  }",
            "}",
        ],
        imposterLine: 2,
        explanation: "A single `=` assigns instead of comparing, so the condition is always the truthy string 'admin' and everyone is granted access.",
        fix: "if (user.role === 'admin')",
    },
    {
        lang: "TypeScript",
        difficulty: "normal",
        title: "Read JSON from an API.",
        lines: [
            "async function loadUsers() {",
            "  const res = await fetch('/api/users');",
            "  const users = res.json();",
            "  return users;",
            "}",
        ],
        imposterLine: 3,
        explanation: "`res.json()` returns a Promise, not the parsed data. Without await, callers receive a pending Promise instead of an array.",
        fix: "const users = await res.json();",
    },
    {
        lang: "TypeScript",
        difficulty: "normal",
        title: "Retry when configured.",
        lines: [
            "const config = { retries: 0 };",
            "if (config.retries) {",
            "  retry();",
            "}",
        ],
        imposterLine: 2,
        explanation: "Zero is falsy, so a valid retries: 0 setting is treated as 'not set' and the branch is skipped. Check for null/undefined instead.",
        fix: "if (config.retries != null)",
    },
    {
        lang: "TypeScript",
        difficulty: "hard",
        title: "Parse untrusted JSON safely.",
        lines: [
            "const user: any = JSON.parse(raw);",
            "console.log(user.name.toUpperCase());",
        ],
        imposterLine: 1,
        explanation: "`any` disables type checking, so a missing name field reaches `.toUpperCase()` and throws at runtime. Use a typed parse and guard the field.",
        fix: "const user = JSON.parse(raw) as { name?: string };\nconsole.log(user.name?.toUpperCase());",
    },

    // ── Go ─────────────────────────────────────────────────────────────
    {
        lang: "Go",
        difficulty: "easy",
        title: "Print every number.",
        lines: [
            "for i := 0; i <= len(nums); i++ {",
            "    fmt.Println(nums[i])",
            "}",
        ],
        imposterLine: 1,
        explanation: "Off-by-one: `<=` lets the loop read one index past the end and panics with an out-of-range error.",
        fix: "for i := 0; i < len(nums); i++",
    },
    {
        lang: "Go",
        difficulty: "normal",
        title: "Open a file.",
        lines: [
            "f, _ := os.Open(\"data.txt\")",
            "defer f.Close()",
        ],
        imposterLine: 1,
        explanation: "Discarding the error with `_` ignores failures, and a failed Open leaves f nil so the deferred Close panics. Handle the error first.",
        fix: "f, err := os.Open(\"data.txt\")\nif err != nil { return err }",
    },
    {
        lang: "Go",
        difficulty: "normal",
        title: "Return an error to the caller.",
        lines: [
            "if err != nil {",
            "    return nil",
            "}",
        ],
        imposterLine: 2,
        explanation: "Returning nil on the error path discards the error, so a failed call can look successful. Return the error itself.",
        fix: "return err",
    },
    {
        lang: "Go",
        difficulty: "hard",
        title: "Count some fruit.",
        lines: [
            "var counts map[string]int",
            "counts[\"apples\"] = 1",
        ],
        imposterLine: 2,
        explanation: "A nil map cannot be written to — the assignment panics. Maps must be initialized with make or a composite literal first.",
        fix: "counts := map[string]int{}",
    },

    // ── C++ ────────────────────────────────────────────────────────────
    {
        lang: "C++",
        difficulty: "easy",
        title: "Print every element.",
        lines: [
            "for (int i = 0; i <= vec.size(); i++) {",
            "    std::cout << vec[i];",
            "}",
        ],
        imposterLine: 1,
        explanation: "Off-by-one: `<=` reads one index past the end of the vector, which is out-of-bounds and undefined behavior.",
        fix: "for (int i = 0; i < vec.size(); i++)",
    },
    {
        lang: "C++",
        difficulty: "normal",
        title: "Free and reuse a pointer.",
        lines: [
            "int* p = new int(5);",
            "delete p;",
            "*p = 6;",
        ],
        imposterLine: 3,
        explanation: "Writing through p after delete is use-after-free — undefined behavior. Free the memory only when done, or use a smart pointer.",
        fix: "std::unique_ptr<int> p = std::make_unique<int>(5);\n*p = 6;",
    },
    {
        lang: "C++",
        difficulty: "normal",
        title: "Erase zeroes from a vector.",
        lines: [
            "for (auto it = vec.begin(); it != vec.end(); ++it) {",
            "    if (*it == 0) vec.erase(it);",
            "}",
        ],
        imposterLine: 2,
        explanation: "erase invalidates the iterator, so the next ++it is undefined behavior. Capture the iterator returned by erase.",
        fix: "if (*it == 0) { it = vec.erase(it); } else { ++it; }",
    },
    {
        lang: "C++",
        difficulty: "hard",
        title: "Return a value by reference.",
        lines: [
            "int& getValue() {",
            "    int x = 5;",
            "    return x;",
            "}",
        ],
        imposterLine: 3,
        explanation: "x is a local variable destroyed when the function returns, so the reference dangles. Return by value.",
        fix: "int getValue() { return 5; }",
    },
];

const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const Mafia = () => {
    const [phase, setPhase] = useState("ready"); // ready | playing | over
    const [difficulty, setDifficulty] = useState("normal");
    const [lang, setLang] = useState("all");
    const [deck, setDeck] = useState([]);
    const [round, setRound] = useState(0);
    const [picked, setPicked] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [lastGain, setLastGain] = useState(0);
    const [best, setBest] = useState(() => readHighScore(HIGH_KEY));
    const [newBest, setNewBest] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const timeLeftRef = useRef(0);

    const difficultyDef = MAFIA_DIFFICULTIES.find((d) => d.id === difficulty) ?? MAFIA_DIFFICULTIES[1];

    const pool = useMemo(
        () =>
            QUESTIONS.filter(
                (q) => (lang === "all" || q.lang === lang) && q.difficulty === difficulty
            ),
        [lang, difficulty]
    );
    const roundCount = Math.min(difficultyDef.rounds, pool.length);

    const question = deck[round];
    const answered = picked !== null;
    const timedOut = picked === -1;
    const ok = answered && picked === question?.imposterLine;

    const start = () => {
        if (!pool.length) return;
        setDeck(shuffle(pool).slice(0, roundCount));
        setRound(0);
        setPicked(null);
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setCorrect(0);
        setLastGain(0);
        setNewBest(false);
        setBest(readHighScore(HIGH_KEY));
        timeLeftRef.current = difficultyDef.timer;
        setTimeLeft(difficultyDef.timer);
        setPhase("playing");
        playWhoosh();
    };

    const vote = (line) => {
        if (answered || !question) return;
        const isImposter = line === question.imposterLine;
        const gain = isImposter ? difficultyDef.base + Math.min(4, streak) * difficultyDef.streakBonus : 0;
        setPicked(line);
        setLastGain(gain);
        setScore((s) => s + gain);
        if (isImposter) {
            const nextStreak = streak + 1;
            setCorrect((c) => c + 1);
            setStreak(nextStreak);
            setBestStreak((b) => Math.max(b, nextStreak));
            playClick();
        } else {
            setStreak(0);
            playWhoosh();
        }
    };

    const nextRound = () => {
        if (round + 1 >= deck.length) {
            const before = readHighScore(HIGH_KEY);
            const finalBest = recordHighScore(HIGH_KEY, score);
            recordGameResult("mafia", score, { correct, bestStreak });
            setNewBest(score > before);
            setBest(finalBest);
            setPhase("over");
            playWhoosh();
            return;
        }
        setRound((r) => r + 1);
        setPicked(null);
        setLastGain(0);
        timeLeftRef.current = difficultyDef.timer;
        setTimeLeft(difficultyDef.timer);
        playClick();
    };

    const backToStart = () => {
        setPhase("ready");
        setPicked(null);
    };

    // Hard mode runs the clock: answer before zero or the imposter slips away.
    const timerRunning = phase === "playing" && difficultyDef.timer > 0 && !answered;

    useEffect(() => {
        if (!timerRunning) return;
        timeLeftRef.current = difficultyDef.timer;
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
    }, [timerRunning, round, difficultyDef.timer]);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="mafia" />
                <h2><MafiaCat />Imposter MAFIA</h2>
            </div>

            {phase === "ready" && (
                <div className="code-body">
                    <div className="code-overlay" style={{ flex: 1 }}>
                        <h3><MagnifierIcon /> Imposter MAFIA</h3>
                        <MafiaReadyScene />
                        <p>1 line is broken. Find it.</p>

                        <div className="mafia-setup">
                            <div className="mafia-difficulty">
                                {MAFIA_DIFFICULTIES.map((d) => (
                                    <button
                                        key={d.id}
                                        type="button"
                                        className={`mafia-diff ${difficulty === d.id ? "active" : ""}`}
                                        onClick={() => setDifficulty(d.id)}
                                    >
                                        <d.Icon />
                                        <b>{d.label}</b>
                                        <small>{d.tagline}</small>
                                    </button>
                                ))}
                            </div>

                            <div className="mafia-lang">
                                <span className="mafia-lang-label">Language</span>
                                <div className="mafia-lang-options">
                                    {MAFIA_LANGS.map((l) => (
                                        <button
                                            key={l.id}
                                            type="button"
                                            className={`mafia-lang-btn ${lang === l.id ? "active" : ""}`}
                                            onClick={() => setLang(l.id)}
                                        >
                                            <l.Icon />
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {pool.length ? (
                                <div className="mafia-setup-stats">
                                    <span className="mafia-stat-chip">
                                        <RoundsIcon /> {roundCount} round{roundCount === 1 ? "" : "s"}
                                    </span>
                                    <span className="mafia-stat-chip">
                                        <BugIcon /> {pool.length} bug{pool.length === 1 ? "" : "s"} ready
                                    </span>
                                </div>
                            ) : (
                                <p className="mafia-setup-sub">No bugs for this language.</p>
                            )}
                        </div>

                        <button
                            type="button"
                            className="code-start"
                            onClick={start}
                            disabled={!pool.length}
                        >
                            <MagnifierIcon /> Start Investigation
                        </button>
                        
                    </div>
                </div>
            )}

            {phase === "playing" && question && (
                <div className="code-body">
                    <div className="code-hud">
                        <span>round <b>{round + 1}/{deck.length}</b></span>
                        <span>score <b>{score}</b></span>
                        <span>streak <b className={streak > 1 ? "code-mult" : ""}>{streak}</b></span>
                        <span>best <b>{best}</b></span>
                        {difficultyDef.timer > 0 && !answered && (
                            <span>time <b className={timeLeft <= 5 ? "mafia-time-low" : ""}>{timeLeft}s</b></span>
                        )}
                    </div>

                    <div className="code-snippet mafia-code" aria-label={`Find the imposter in this ${question.lang} code`}>
                        <div className="mafia-snippet-head">
                            {(() => {
                                const LangIcon = LANG_ICONS[question.lang];
                                return LangIcon ? <LangIcon /> : null;
                            })()}
                            <span className="c-lang">{question.lang}</span>
                            <span className="mafia-diff-tag">{difficultyDef.label}</span>
                        </div>
                        {question.lines.map((line, i) => {
                            const lineNo = i + 1;
                            const isImposter = lineNo === question.imposterLine;
                            const isPicked = picked === lineNo;
                            const wrongPick = answered && isPicked && !isImposter;
                            return (
                                <button
                                    type="button"
                                    key={lineNo}
                                    className={`mafia-line ${answered && isImposter ? "is-imposter" : ""} ${wrongPick ? "is-wrong" : ""}`}
                                    onClick={() => vote(lineNo)}
                                    disabled={answered}
                                    aria-pressed={isPicked}
                                >
                                    <span className="mafia-line-no">{lineNo}</span>
                                    <code>{line || " "}</code>
                                    {answered && isImposter && <span className="mafia-tag">IMPOSTER</span>}
                                    {wrongPick && <span className="mafia-tag wrong">YOUR VOTE</span>}
                                </button>
                            );
                        })}
                    </div>

                    {answered ? (
                        <div className={`code-tip ${ok ? "is-correct" : "is-wrong"}`}>
                            <b>
                                {timedOut
                                    ? "Time's up. The imposter got away."
                                    : ok
                                        ? `Imposter voted out! +${lastGain}`
                                        : "The imposter got away."}
                            </b>
                            <p>{question.explanation}</p>
                            {question.fix && (
                                <p className="mafia-fix">
                                    <span>fix</span> {question.fix}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="code-tip">
                            <b className="c-tip-lang">{question.lang}</b> {question.title}
                        </div>
                    )}

                    <div className="mafia-actions">
                        {!answered ? (
                            <p className="mafia-hint">Read each line, then vote for the bug.</p>
                        ) : (
                            <button type="button" className="code-start" onClick={nextRound}>
                                {round + 1 >= deck.length ? "See results" : "Next round"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {phase === "over" && (
                <div className="code-body">
                    <div className="code-overlay" style={{ flex: 1 }}>
                        <h3>Case Closed</h3>
                        <MafiaBustedScene />
                        <p className="mafia-results-line">
                            <b className="c-stat">{score}</b> pts
                        </p>
                        <div className="mafia-results-stats">
                            <span className="mafia-stat-chip">
                                <BustedIcon /> {correct}/{deck.length} busted
                            </span>
                            {bestStreak > 1 && (
                                <span className="mafia-stat-chip">
                                    <StreakIcon /> streak {bestStreak}
                                </span>
                            )}
                        </div>
                        {newBest && <p className="mafia-new-best">New best!</p>}
                        <button type="button" className="code-start" onClick={start}>
                            <ReplayIcon /> Play Again
                        </button>
                        <button type="button" className="mafia-text-btn" onClick={backToStart}>
                            Case Files
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const MafiaWindow = WindowWrapper(Mafia, "mafia");
export default MafiaWindow;

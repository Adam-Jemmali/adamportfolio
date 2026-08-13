import { useEffect, useRef, useState } from "react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

const GAME_TIME = 60;

// Normalize every snippet to single spaces so the typing race is never unfair.
const normalize = (code) => code.trim().replace(/[ \t]+/g, " ");

// Fisher-Yates shuffle — every game deals a fresh, random order.
const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// Real tasks people and interns type every day — not contrived one-liners.
const RAW_SNIPPETS = [
    // Python — scripting and backend chores
    { code: "def add(a, b): return a + b", lang: "Python", tip: "Add two numbers." },
    { code: "for i in range(10): print(i)", lang: "Python", tip: "Loop and print 0 through 9." },
    { code: "data = json.loads(response.text)", lang: "Python", tip: "Parse a JSON string into a dict." },
    { code: 'users = [u for u in rows if u["active"]]', lang: "Python", tip: "Filter a list with a comprehension." },
    { code: 'with open("log.txt") as f: lines = f.readlines()', lang: "Python", tip: "Read a file safely with a context manager." },
    { code: "result = 10 / x if x else 0", lang: "Python", tip: "Avoid a divide-by-zero crash." },
    { code: "sorted_users = sorted(users, key=lambda u: u.name)", lang: "Python", tip: "Sort objects by an attribute." },
    { code: "def fetch(url): return requests.get(url).json()", lang: "Python", tip: "GET JSON from an API." },
    { code: 'api_key = os.getenv("API_KEY", "dev")', lang: "Python", tip: "Read an env var with a default." },
    { code: "counts = Counter(words)", lang: "Python", tip: "Count how often each word appears." },

    // JavaScript / React — everyday frontend work
    { code: "const doubled = nums.map(n => n * 2);", lang: "JavaScript", tip: "Map each item to its double." },
    { code: "const active = users.filter(u => u.isActive);", lang: "JavaScript", tip: "Keep only the active users." },
    { code: "const total = prices.reduce((sum, p) => sum + p, 0);", lang: "JavaScript", tip: "Sum an array with reduce." },
    { code: "const user = users.find(u => u.id === 42);", lang: "JavaScript", tip: "Find the first item matching an id." },
    { code: "const data = await fetch(url).then(r => r.json());", lang: "JavaScript", tip: "Fetch and parse JSON." },
    { code: "const [count, setCount] = useState(0);", lang: "React", tip: "Declare state with a setter." },
    { code: "useEffect(() => { load(); }, [id]);", lang: "React", tip: "Run an effect when id changes." },
    { code: 'const name = user?.profile?.name ?? "Guest";', lang: "JavaScript", tip: "Optional chaining with a fallback." },
    { code: "const sorted = [...items].sort((a, b) => a - b);", lang: "JavaScript", tip: "Sort numbers without mutating the array." },
    { code: 'const slug = title.toLowerCase().replace(/ /g, "-");', lang: "JavaScript", tip: "Turn a title into a URL slug." },
    { code: "const greeting = `Hello, ${name}!`;", lang: "JavaScript", tip: "Interpolate a variable into a string." },
    { code: "const unique = [...new Set(ids)];", lang: "JavaScript", tip: "Remove duplicates from an array." },

    // Git / Shell — what interns run in the terminal every day
    { code: "git checkout -b feature/login", lang: "Git", tip: "Create and switch to a new branch." },
    { code: 'git add . && git commit -m "fix login bug"', lang: "Git", tip: "Stage everything and commit." },
    { code: "git pull origin main", lang: "Git", tip: "Sync main from the remote." },
    { code: "npm install react", lang: "Shell", tip: "Add the React package." },
    { code: "npm run build", lang: "Shell", tip: "Create a production build." },
    { code: "docker compose up -d", lang: "Shell", tip: "Start containers in the background." },
    { code: "ssh deploy@server.example.com", lang: "Shell", tip: "Connect to a server over SSH." },
    { code: "ps aux | grep node", lang: "Shell", tip: "Find running node processes." },
    { code: "tar -czf backup.tar.gz ./data", lang: "Shell", tip: "Compress a folder into an archive." },
    { code: "curl -s https://api.example.com/health", lang: "Shell", tip: "Check an API endpoint." },

    // SQL — real database queries
    { code: "SELECT * FROM users WHERE active = 1;", lang: "SQL", tip: "Fetch every active user." },
    { code: "UPDATE users SET role = 'admin' WHERE id = 42;", lang: "SQL", tip: "Promote a user to admin." },
    { code: "INSERT INTO orders (user_id, total) VALUES (42, 9.99);", lang: "SQL", tip: "Insert a new order row." },
    { code: "DELETE FROM sessions WHERE expires_at < NOW();", lang: "SQL", tip: "Remove expired sessions." },
    { code: "SELECT COUNT(*) FROM orders WHERE status = 'paid';", lang: "SQL", tip: "Count paid orders." },

    // CSS / HTML — layout and markup
    { code: "display: flex; justify-content: space-between;", lang: "CSS", tip: "Flex layout with items pushed apart." },
    { code: ".card { border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); }", lang: "CSS", tip: "Round corners and add a shadow." },
    { code: "<button onClick={handleClick}>Submit</button>", lang: "HTML", tip: "React button with a click handler." },
];

const SNIPPETS = RAW_SNIPPETS.map((s) => ({ ...s, code: normalize(s.code) }));

const CodeGame = () => {
    const [phase, setPhase] = useState("ready"); // ready | playing | over
    const [deck, setDeck] = useState(() => shuffle(SNIPPETS));
    const [snippetIdx, setSnippetIdx] = useState(0);
    const [typed, setTyped] = useState("");
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(0);
    const [correctKeys, setCorrectKeys] = useState(0);
    const [totalKeys, setTotalKeys] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME);
    const [high, setHigh] = useState(() => Number(localStorage.getItem("mj-code-high")) || 0);

    const inputRef = useRef(null);
    const snippet = deck[snippetIdx] ?? deck[0];

    const start = () => {
        setPhase("playing");
        setDeck(shuffle(SNIPPETS));
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
            const next = snippetIdx + 1;
            if (next >= deck.length) {
                setDeck(shuffle(SNIPPETS));
                setSnippetIdx(0);
            } else {
                setSnippetIdx(next);
            }
        }
    };

    const accuracy = totalKeys ? Math.round((correctKeys / totalKeys) * 100) : 100;
    const wpm = Math.round(correctKeys / 5);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="code" />
                <h2>Code Racer</h2>
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
                                : "Type real dev tasks exactly as shown for 60 seconds. Every race deals a fresh shuffle."}
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

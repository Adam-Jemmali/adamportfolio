import { useEffect, useRef, useState } from "react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { recordGameResult } from "#game/highscores.js";

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
// Snippets are written compact (no space after a comma, no space around `=`)
// so racers never waste keystrokes on spacing.
const RAW_SNIPPETS = [
    // Python — scripting and backend chores
    { code: "def add(a,b): return a+b", lang: "Python", tip: "Add two numbers." },
    { code: "for i in range(10): print(i)", lang: "Python", tip: "Loop and print 0 through 9." },
    { code: "data=json.loads(response.text)", lang: "Python", tip: "Parse a JSON string into a dict." },
    { code: 'users=[u for u in rows if u["active"]]', lang: "Python", tip: "Filter a list with a comprehension." },
    { code: 'with open("log.txt") as f: lines=f.readlines()', lang: "Python", tip: "Read a file safely with a context manager." },
    { code: "result=10/x if x else 0", lang: "Python", tip: "Avoid a divide-by-zero crash." },
    { code: "sorted_users=sorted(users,key=lambda u:u.name)", lang: "Python", tip: "Sort objects by an attribute." },
    { code: "def fetch(url): return requests.get(url).json()", lang: "Python", tip: "GET JSON from an API." },
    { code: 'api_key=os.getenv("API_KEY","dev")', lang: "Python", tip: "Read an env var with a default." },
    { code: "counts=Counter(words)", lang: "Python", tip: "Count how often each word appears." },
    { code: "config=settings.get(\"retries\",3)", lang: "Python", tip: "Read a setting with a fallback." },
    { code: "for key,val in items.items(): print(key,val)", lang: "Python", tip: "Loop over a dict's keys and values." },
    { code: "first,rest=rows[0],rows[1:]", lang: "Python", tip: "Split a list into head and tail." },
    { code: "text=html.unescape(raw)", lang: "Python", tip: "Decode HTML entities." },
    { code: "total=sum(x for x in nums if x>0)", lang: "Python", tip: "Sum only positive numbers." },
    { code: "rows=sorted(rows,key=lambda r:r[\"created\"],reverse=True)", lang: "Python", tip: "Sort newest first." },
    { code: "prices=[round(p*1.13,2) for p in prices]", lang: "Python", tip: "Add tax to every price." },
    { code: "df=df.dropna().fillna(0)", lang: "Python", tip: "Clean missing values in a frame." },
    { code: "path=Path(\"data\")/f\"{uid}.json\"", lang: "Python", tip: "Build a file path." },
    { code: "result=db.execute(sql,params).fetchone()", lang: "Python", tip: "Run a parameterized query." },
    { code: "data=json.loads(raw) if raw else {}", lang: "Python", tip: "Parse JSON with a safe fallback." },
    { code: "name=f\"user_{id}-{int(time.time())}\"", lang: "Python", tip: "Build a unique id with an f-string." },

    // JavaScript / React — everyday frontend work
    { code: "const doubled=nums.map(n=>n*2);", lang: "JavaScript", tip: "Map each item to its double." },
    { code: "const active=users.filter(u=>u.isActive);", lang: "JavaScript", tip: "Keep only the active users." },
    { code: "const total=prices.reduce((sum,p)=>sum+p,0);", lang: "JavaScript", tip: "Sum an array with reduce." },
    { code: "const user=users.find(u=>u.id===42);", lang: "JavaScript", tip: "Find the first item matching an id." },
    { code: "const data=await fetch(url).then(r=>r.json());", lang: "JavaScript", tip: "Fetch and parse JSON." },
    { code: "const [count,setCount]=useState(0);", lang: "React", tip: "Declare state with a setter." },
    { code: "useEffect(()=>{load();},[id]);", lang: "React", tip: "Run an effect when id changes." },
    { code: 'const name=user?.profile?.name??"Guest";', lang: "JavaScript", tip: "Optional chaining with a fallback." },
    { code: "const sorted=[...items].sort((a,b)=>a-b);", lang: "JavaScript", tip: "Sort numbers without mutating the array." },
    { code: 'const slug=title.toLowerCase().replace(/ /g,"-");', lang: "JavaScript", tip: "Turn a title into a URL slug." },
    { code: "const greeting=`Hello, ${name}!`;", lang: "JavaScript", tip: "Interpolate a variable into a string." },
    { code: "const unique=[...new Set(ids)];", lang: "JavaScript", tip: "Remove duplicates from an array." },
    { code: "const {name,age}=user;", lang: "JavaScript", tip: "Destructure object fields." },
    { code: "setTimeout(()=>setOpen(false),3000);", lang: "JavaScript", tip: "Close after a delay." },
    { code: "items.map(item=>(<li key={item.id}>{item.name}</li>))", lang: "React", tip: "Render a list from data." },
    { code: "try{const data=await res.json();}catch(e){setError(e);}", lang: "JavaScript", tip: "Handle a failed fetch." },
    { code: "localStorage.setItem(\"token\",token);", lang: "JavaScript", tip: "Persist a token." },
    { code: "window.addEventListener(\"resize\",onResize);", lang: "JavaScript", tip: "Listen for resize events." },
    { code: "const msg=cond?\"yes\":\"no\";", lang: "JavaScript", tip: "Ternary shorthand." },
    { code: "navigator.clipboard.writeText(text);", lang: "JavaScript", tip: "Copy to the clipboard." },
    { code: "const cfg={...defaults,...overrides};", lang: "JavaScript", tip: "Merge config objects." },
    { code: "const el=document.getElementById(\"app\");", lang: "JavaScript", tip: "Grab a DOM element." },

    // Git / Shell — what interns run in the terminal every day
    { code: "git checkout -b feature/login", lang: "Git", tip: "Create and switch to a new branch." },
    { code: 'git add .&&git commit -m "fix login bug"', lang: "Git", tip: "Stage everything and commit." },
    { code: "git pull origin main", lang: "Git", tip: "Sync main from the remote." },
    { code: "npm install react", lang: "Shell", tip: "Add the React package." },
    { code: "npm run build", lang: "Shell", tip: "Create a production build." },
    { code: "docker compose up -d", lang: "Shell", tip: "Start containers in the background." },
    { code: "ssh deploy@server.example.com", lang: "Shell", tip: "Connect to a server over SSH." },
    { code: "ps aux|grep node", lang: "Shell", tip: "Find running node processes." },
    { code: "tar -czf backup.tar.gz ./data", lang: "Shell", tip: "Compress a folder into an archive." },
    { code: "curl -s https://api.example.com/health", lang: "Shell", tip: "Check an API endpoint." },
    { code: "git stash", lang: "Git", tip: "Shelve changes for later." },
    { code: "git log --oneline -5", lang: "Git", tip: "Show the last five commits." },
    { code: "git diff --stat", lang: "Git", tip: "Summarize uncommitted changes." },
    { code: "git reset --hard HEAD~1", lang: "Git", tip: "Undo the last commit." },
    { code: "git push origin feature/login", lang: "Git", tip: "Push a branch to the remote." },
    { code: "mkdir -p src/components", lang: "Shell", tip: "Create nested folders at once." },
    { code: "chmod +x deploy.sh", lang: "Shell", tip: "Make a script executable." },
    { code: "grep -rn \"TODO\" src", lang: "Shell", tip: "Find TODO comments." },
    { code: "kubectl get pods -n prod", lang: "Shell", tip: "List pods in a namespace." },
    { code: "systemctl restart nginx", lang: "Shell", tip: "Restart the web server." },
    { code: "kill -9 4321", lang: "Shell", tip: "Force-kill a process by pid." },
    { code: "npm test -- --watch", lang: "Shell", tip: "Run tests in watch mode." },

    // SQL — real database queries
    { code: "SELECT * FROM users WHERE active=1;", lang: "SQL", tip: "Fetch every active user." },
    { code: "UPDATE users SET role='admin' WHERE id=42;", lang: "SQL", tip: "Promote a user to admin." },
    { code: "INSERT INTO orders (user_id,total) VALUES (42,9.99);", lang: "SQL", tip: "Insert a new order row." },
    { code: "DELETE FROM sessions WHERE expires_at<NOW();", lang: "SQL", tip: "Remove expired sessions." },
    { code: "SELECT COUNT(*) FROM orders WHERE status='paid';", lang: "SQL", tip: "Count paid orders." },
    { code: "SELECT u.name,o.total FROM users u JOIN orders o ON o.user_id=u.id;", lang: "SQL", tip: "Join users to their orders." },
    { code: "SELECT status,COUNT(*) FROM orders GROUP BY status;", lang: "SQL", tip: "Count orders per status." },
    { code: "SELECT * FROM users ORDER BY created_at DESC LIMIT 10;", lang: "SQL", tip: "Fetch the ten newest users." },
    { code: "SELECT DISTINCT country FROM users;", lang: "SQL", tip: "List unique countries." },
    { code: "CREATE TABLE carts (id INTEGER PRIMARY KEY,user_id INTEGER);", lang: "SQL", tip: "Create a cart table." },
    { code: "ALTER TABLE users ADD COLUMN bio TEXT;", lang: "SQL", tip: "Add a column to a table." },
    { code: "SELECT * FROM users WHERE name LIKE 'A%';", lang: "SQL", tip: "Find names starting with A." },

    // CSS / HTML — layout and markup
    { code: "display:flex;justify-content:space-between;", lang: "CSS", tip: "Flex layout with items pushed apart." },
    { code: ".card { border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.2); }", lang: "CSS", tip: "Round corners and add a shadow." },
    { code: "<button onClick={handleClick}>Submit</button>", lang: "HTML", tip: "React button with a click handler." },
    { code: "@media (max-width:768px){.grid{grid-template-columns:1fr;}}", lang: "CSS", tip: "Stack columns on small screens." },
    { code: ".btn{transition:all 0.2s ease;}", lang: "CSS", tip: "Animate property changes." },
    { code: ".card:hover{transform:translateY(-4px);}", lang: "CSS", tip: "Lift the card on hover." },
    { code: "grid-template-columns:repeat(3,1fr);", lang: "CSS", tip: "Three equal grid columns." },
    { code: "position:absolute;inset:0;margin:auto;", lang: "CSS", tip: "Center with absolute positioning." },
    { code: "<img src=\"/logo.png\" alt=\"Logo\" loading=\"lazy\" />", lang: "HTML", tip: "Image with lazy loading." },
    { code: "<a href=\"/docs\" className=\"link\">Docs</a>", lang: "HTML", tip: "Anchor link with a class." },
    { code: "<input type=\"email\" required placeholder=\"you@site.com\" />", lang: "HTML", tip: "Required email input." },
];

// Deal a fresh shuffled deck, never immediately repeating the snippet that
// was just finished, so every race (and mid-race reshuffle) feels new.
const deal = (avoid) => shuffle(avoid ? SNIPPETS.filter((s) => s.code !== avoid.code) : SNIPPETS);

const SNIPPETS = RAW_SNIPPETS.map((s) => ({ ...s, code: normalize(s.code) }));

// The hamster itself, as a reusable little SVG.
const HamsterSvg = ({ scared, done, idle, variant, className = "" }) => (
    <svg viewBox="0 0 48 44" className={`hamster-svg ${variant === "rival" ? "is-rival " : ""}${className}`} aria-hidden="true">
        <circle cx="38" cy="30" r="3" className="h-tail" />
        <ellipse cx="24" cy="28" rx="14" ry="12" className="h-body" />
        <ellipse cx="24" cy="31" rx="8" ry="7" className="h-belly" />
        <circle cx="14" cy="15" r="4.5" className="h-ear" />
        <circle cx="34" cy="15" r="4.5" className="h-ear" />
        <circle cx="14" cy="15" r="2" className="h-ear-in" />
        <circle cx="34" cy="15" r="2" className="h-ear-in" />
        <circle cx="16.5" cy="28.5" r="2.4" className="h-cheek" />
        <circle cx="31.5" cy="28.5" r="2.4" className="h-cheek" />
        {done ? (
            <g className="h-face-done">
                <path d="M17 24 q2 -2.6 4 0" className="h-eye" />
                <path d="M27 24 q2 -2.6 4 0" className="h-eye" />
                <path d="M20 31 q4 4 8 0" className="h-mouth" />
            </g>
        ) : scared ? (
            <g className="h-face-scared">
                <circle cx="19" cy="24" r="3.6" className="h-eye-big" />
                <circle cx="29" cy="24" r="3.6" className="h-eye-big" />
                <circle cx="19" cy="24" r="1.3" className="h-pupil" />
                <circle cx="29" cy="24" r="1.3" className="h-pupil" />
                <ellipse cx="24" cy="31" rx="2.6" ry="3.6" className="h-mouth" />
                <path d="M9 15 l-3 -4 M7 18 l-4 -2" className="h-sweat" />
                <path d="M39 15 l3 -4 M41 18 l4 -2" className="h-sweat" />
            </g>
        ) : idle ? (
            <g className="h-face-idle">
                <circle cx="21" cy="24" r="1.8" className="h-eye" />
                <circle cx="29" cy="24" r="1.8" className="h-eye" />
                <path d="M21 31 q2.5 1.5 5 0" className="h-mouth" />
                <ellipse cx="33" cy="30" rx="2.2" ry="1.4" className="h-seed" />
            </g>
        ) : (
            <g className="h-face-run">
                <circle cx="19" cy="24" r="2" className="h-eye" />
                <circle cx="29" cy="24" r="2" className="h-eye" />
                <path d="M21 30 q3 2 6 0" className="h-mouth" />
            </g>
        )}
        {/* Frantic sweat — only visible when the timer runs low. */}
        <path d="M10 16 l-2.5 -3.5 M38 16 l2.5 -3.5" className="h-sweat2" />
        <ellipse cx="18" cy="39" rx="3" ry="2" className="h-foot" />
        <ellipse cx="30" cy="39" rx="3" ry="2" className="h-foot" />
    </svg>
);

// A little hamster that runs along a track as fast as you type. Wrong keys
// make it bolt backwards in a panic; finishing a snippet parks it at the end.
const Hamster = ({ progress, scared, scareKey, done, celebrate, streak, frantic, running, speed, idle, rival, points }) => {
    const pct = Math.min(97, Math.max(3, progress * 100));
    const rpct = Math.min(97, Math.max(3, rival * 100));
    const dust = Math.min(6, Math.max(0, Math.round(speed * 1.2)));
    return (
        <div className="hamster-track">
            <span className="h-flag" aria-hidden="true">
                <svg viewBox="0 0 14 18">
                    <rect x="5" y="1" width="2" height="16" fill="#9ca3af" />
                    <path d="M7 2 h7 v7 h-7 z" fill="#ffffff" />
                    <path d="M7 5 h7 M9.5 2 v7 M12 2 v7" stroke="#334155" strokeWidth="1" />
                </svg>
            </span>
            <div
                className="hamster h-rival"
                style={{ left: `${rpct}%`, zIndex: rival > progress ? 3 : 1 }}
            >
                <span className="h-rival-tag">RIVAL</span>
                <div className={`hamster-anim is-running ${rival >= 1 ? "is-done" : ""}`}>
                    <HamsterSvg variant="rival" done={rival >= 1} />
                </div>
            </div>
            <div className="hamster" style={{ left: `${pct}%` }}>
                {done && celebrate && streak >= 2 && (
                    <span className="h-streak">Perfect x{streak} +{points}</span>
                )}
                <div
                    key={scareKey}
                    className={`hamster-anim ${running && !done && !scared && !idle ? "is-running" : ""} ${frantic ? "is-frantic" : ""} ${scared ? "is-scared" : ""} ${idle && !done && !scared ? "is-idle" : ""} ${done ? (celebrate ? "is-celebrate" : "is-done") : ""}`}
                >
                    <HamsterSvg scared={scared} done={done} idle={idle} />
                    {dust > 0 && running && !done && !scared && !idle && (
                        <span className={`h-dust dust-${dust}`} aria-hidden="true">
                            <i /><i /><i /><i /><i /><i />
                        </span>
                    )}
                    {done && <span className="h-sparkle">✦</span>}
                </div>
            </div>
        </div>
    );
};

// A little victory portrait for the results screen — the same hamster,
// bobbing happily with sparkles, instead of parked mid-track.
const HamsterVictory = () => (
    <div className="hamster-victory">
        <div className="hamster-anim is-victory">
            <HamsterSvg done />
            <span className="h-sparkle victory-sparkle-a">✦</span>
            <span className="h-sparkle victory-sparkle-b">✦</span>
            <span className="h-sparkle victory-sparkle-c">✦</span>
        </div>
    </div>
);

// Opening portrait — the hamster waiting at the start line, nibbling a
// seed until you start typing.
const HamsterIdle = () => (
    <div className="hamster-victory">
        <div className="hamster-anim is-idle">
            <HamsterSvg idle />
        </div>
    </div>
);

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
    // Hamster state: how far along the track it is, and its mood.
    const [progress, setProgress] = useState(0);
    const [scared, setScared] = useState(false);
    const [scareKey, setScareKey] = useState(0);
    const [done, setDone] = useState(false);
    const [celebrate, setCelebrate] = useState(false);
    const [streak, setStreak] = useState(0);
    const [snippetClean, setSnippetClean] = useState(true);
    const [speed, setSpeed] = useState(0);
    const [idle, setIdle] = useState(false); // hamster looks around when you pause
    const [rival, setRival] = useState(0); // rival hamster's progress (0..1)
    const keyTimesRef = useRef([]); // recent keystroke timestamps, for typing speed
    const lastKeyRef = useRef(Date.now()); // last keystroke, for the idle state

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
        setProgress(0);
        setScared(false);
        setScareKey(0);
        setDone(false);
        setCelebrate(false);
        setStreak(0);
        setSnippetClean(true);
        setSpeed(0);
        setIdle(false);
        setRival(0);
        keyTimesRef.current = [];
        lastKeyRef.current = Date.now();
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

    // The rival hamster runs on its own clock at a steady, medium-fast pace —
    // it doesn't wait for you to type before it starts moving, so a slow
    // start actually costs you ground.
    useEffect(() => {
        if (phase !== "playing" || done) return;
        const RIVAL_SNIPPET_SECONDS = 4.5;
        const id = setInterval(() => {
            setRival((r) => Math.min(1, r + (100 / (RIVAL_SNIPPET_SECONDS * 1000))));
        }, 100);
        return () => clearInterval(id);
    }, [phase, done]);

    // Persist high score at game over.
    useEffect(() => {
        if (phase === "over") {
            setHigh((prev) => {
                const best = Math.max(prev, score);
                localStorage.setItem("mj-code-high", String(best));
                return best;
            });
            recordGameResult("code", score);
        }
    }, [phase, score]);

    // Pause typing for three seconds and the hamster stops to nibble and look
    // around; the first key you press snaps it straight back to running.
    useEffect(() => {
        if (phase !== "playing") return;
        const id = setInterval(() => {
            setIdle(Date.now() - lastKeyRef.current > 3000);
        }, 500);
        return () => clearInterval(id);
    }, [phase]);

    // Players should never be punished for spacing: any run of spaces they
    // type collapses to a single space, so a double space (or a snippet that
    // has one) can't break the match or force extra spacebar presses.
    const collapseSpaces = (s) => s.replace(/[ \t]+/g, " ");

    const handleChange = (e) => {
        if (phase !== "playing") return;
        lastKeyRef.current = Date.now();
        setIdle(false);
        const val = collapseSpaces(e.target.value);
        const code = snippet.code;
        if (val.length > code.length) return; // ignore overshoot

        // Count newly typed characters only (ignore backspaces).
        if (val.length > typed.length) {
            let correct = 0;
            let wrong = 0;
            for (let i = typed.length; i < val.length; i++) {
                if (val[i] === code[i]) correct++;
                else wrong++;
            }
            setTotalKeys((t) => t + (val.length - typed.length));
            setCorrectKeys((c) => c + correct);

            // A wrong key spooks the hamster: it bolts backwards in a panic.
            if (wrong > 0) {
                setScared(true);
                setScareKey((k) => k + 1);
                setSnippetClean(false);
                setCelebrate(false);
            } else {
                setScared(false);
            }

            // Typing speed = keystrokes in the last 2 seconds, for the dust trail.
            const now = Date.now();
            keyTimesRef.current = [...keyTimesRef.current.filter((t) => now - t < 2000), now];
            setSpeed(keyTimesRef.current.length / 2);
        }

        setTyped(val);

        // The hamster only advances on correct characters, so it runs exactly
        // as fast as you're typing and never gains on mistakes.
        let correctChars = 0;
        for (let i = 0; i < val.length && i < code.length; i++) {
            if (val[i] === code[i]) correctChars++;
        }
        setProgress(code.length ? correctChars / code.length : 0);

        if (val === code) {
            // A clean run (no mistakes) grows the streak and the score multiplier.
            const nextStreak = snippetClean ? streak + 1 : 0;
            const mult = Math.min(3, 1 + Math.max(0, nextStreak - 1) * 0.5);
            setStreak(nextStreak);
            setCelebrate(snippetClean);
            setSnippetClean(true);
            setDone(true);
            setProgress(1);
            setScore((s) => s + Math.round((10 + code.length) * mult));
            setCompleted((c) => c + 1);
            setTyped("");
            const next = snippetIdx + 1;
            if (next >= deck.length) {
                setDeck(deal(snippet));
                setSnippetIdx(0);
            } else {
                setSnippetIdx(next);
            }
            // Let the celebration play, then reset the hamster for the next line.
            setTimeout(() => {
                setDone(false);
                setProgress(0);
                setScared(false);
                setScareKey(0);
                setCelebrate(false);
                setRival(0);
            }, 800);
        }
    };

    const accuracy = totalKeys ? Math.round((correctKeys / totalKeys) * 100) : 100;
    const wpm = Math.round(correctKeys / 5);
    const mult = Math.min(3, 1 + Math.max(0, streak - 1) * 0.5);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="code" />
                <h2>
                    <HamsterSvg className="hamster-title" />
                    Code Racer
                </h2>
            </div>

            <div className="code-body">
                {phase === "playing" ? (
                    <>
                        <div className="code-hud">
                            <span>time <b>{timeLeft}s</b></span>
                            <span>score <b>{score}</b></span>
                            <span>mult <b className={mult > 1 ? "code-mult" : ""}>x{mult.toFixed(1)}</b></span>
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

                        <Hamster
                            progress={progress}
                            scared={scared}
                            scareKey={scareKey}
                            done={done}
                            celebrate={celebrate}
                            streak={streak}
                            frantic={timeLeft <= 10}
                            running={phase === "playing"}
                            speed={speed}
                            idle={idle}
                            rival={rival}
                            points={Math.round((10 + snippet.code.length) * mult)}
                        />

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
                            <b className="c-tip-lang">{snippet.lang}</b> {snippet.tip}
                        </div>
                    </>
                ) : (
                    <div className="code-overlay" style={{ flex: 1 }}>
                        <h3>{phase === "over" ? "Time's up!" : "Code Racer"}</h3>
                        {phase === "over" && <HamsterVictory />}
                        {phase === "ready" && <HamsterIdle />}
                        <p>
                            {phase === "over"
                                ? <>You completed <b className="c-stat">{completed}</b> snippet{completed === 1 ? "" : "s"}, <b className="c-stat">{wpm}</b> wpm, <b className="c-stat">{accuracy}%</b> accuracy.</>
                                : "Type most used  dev tasks exactly as shown for 60 seconds. "}
                        </p>
                        {phase === "over" && <p className="text-cyan-300!">high score: {high}</p>}
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

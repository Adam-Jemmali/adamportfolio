import React, { useEffect, useRef, useState } from 'react'
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import WindowsControls from "#components/WindowsControls.jsx";
import { Penguin } from "#components/AppMascots.jsx";
import { techStack, skillMeta, locations } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";

const HELP = [
    ["help, ls", "show this help"],
    ["tech, skills", "print the tech stack (npm show tech stack)"],
    ["portfolio, projects", "open my portfolio"],
    ["blog, web", "open top videos"],
    ["gallery", "open the gallery"],
    ["contact", "open contact"],
    ["resume, cv", "open my resume"],
    ["journey", "open my experience & education"],
    ["neurodesk", "open the NeuroDesk project"],
    ["omni", "open the OmniContext OS project"],
    ["aeroguard", "open the AeroGuard project"],
    ["games", "open the games launcher"],
    ["snake", "play Snake"],
    ["code, learn", "learn to code (Code Racer)"],
    ["whoami", "who am I"],
    ["date", "current date"],
    ["clear", "clear the terminal"],
];

const BANNER = [
    { id: "banner-1", kind: "ok", content: "Adam Jemmali OS terminal" },
    { id: "banner-2", kind: "dim", content: 'Type "help" or "ls" to see what you can do.' },
];

const Terminal = () => {
    const { openWindow, focusWindow } = useWindowStore();
    const setActiveLocation = useLocationStore((s) => s.setActiveLocation);

    const [lines, setLines] = useState(BANNER);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([]);
    const [histIdx, setHistIdx] = useState(-1);

    const linesRef = useRef(null);
    const inputRef = useRef(null);
    const idRef = useRef(0);

    const nextId = () => ++idRef.current;

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const el = linesRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [lines]);

    const launch = (key) => {
        openWindow(key);
        focusWindow(key);
        return `opened ${key}…`;
    };

    const openFinderAt = (location) => {
        setActiveLocation(location);
        openWindow("finder");
        focusWindow("finder");
        return `opened ${location?.name ?? "portfolio"}…`;
    };

    const run = (raw) => {
        const cmd = raw.trim().toLowerCase();
        const out = [{ id: nextId(), kind: "echo", content: `adam@jemmali:~$ ${raw}` }];

        if (!cmd) {
            setLines((l) => [...l, ...out]);
            return;
        }

        const push = (kind, content) => out.push({ id: nextId(), kind, content });

        if (["help", "ls", "--help", "-h", "?"].includes(cmd)) {
            out.push({ id: nextId(), kind: "out", content: "Available commands:" });
            HELP.forEach(([c, d]) => out.push({ id: nextId(), kind: "help", cmd: c, desc: d }));
        } else if (["tech", "techstack", "stack", "skills", "npm show tech stack"].includes(cmd)) {
            out.push({ id: nextId(), kind: "stack" });
        } else if (["portfolio", "projects", "finder"].includes(cmd)) {
            push("ok", openFinderAt(locations.work));
        } else if (["blog", "web", "safari"].includes(cmd)) {
            push("ok", launch("safari"));
        } else if (["gallery", "photos"].includes(cmd)) {
            push("ok", launch("photos"));
        } else if (["contact", "email"].includes(cmd)) {
            push("ok", launch("contact"));
        } else if (["resume", "cv"].includes(cmd)) {
            push("ok", launch("resume"));
        } else if (["journey", "experience", "education", "timeline"].includes(cmd)) {
            push("ok", launch("journey"));
        } else if (["games", "game"].includes(cmd)) {
            push("ok", launch("games"));
        } else if (["snake"].includes(cmd)) {
            push("ok", launch("snake"));
        } else if (["code", "learn", "codegame"].includes(cmd)) {
            push("ok", launch("code"));
        } else if (["neurodesk"].includes(cmd)) {
            const folder = locations.work.children.find((f) => f.name.toLowerCase().includes("neurodesk"));
            push("ok", openFinderAt(folder));
        } else if (["omni", "omnicontext", "omnicontext os", "omnicontect"].includes(cmd)) {
            const folder = locations.work.children.find((f) => f.name.toLowerCase().includes("omnicontext"));
            push("ok", openFinderAt(folder));
        } else if (["aeroguard", "aegis"].includes(cmd)) {
            const folder = locations.work.children.find((f) => f.name.toLowerCase().includes("aeroguard"));
            push("ok", openFinderAt(folder));
        } else if (cmd === "whoami") {
            push("out", "Adam Jemmali: Computer Vision & AI Systems engineer");
        } else if (cmd === "date") {
            push("out", new Date().toLocaleString());
        } else if (cmd === "clear" || cmd === "cls") {
            setLines([]);
            return;
        } else if (cmd.startsWith("sudo")) {
            push("err", "adam is not in the sudoers file. This incident will be reported. \u{1F604}");
        } else {
            push("err", `command not found: ${raw}. Type "help"`);
        }

        setLines((l) => [...l, ...out]);
    };

    const handleKey = (e) => {
        if (e.key === "Enter") {
            run(input);
            setHistory((h) => [input, ...h]);
            setHistIdx(-1);
            setInput("");
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            const ni = Math.min(histIdx + 1, history.length - 1);
            if (history[ni] !== undefined) {
                setHistIdx(ni);
                setInput(history[ni]);
            }
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            const ni = histIdx - 1;
            if (ni < 0) {
                setHistIdx(-1);
                setInput("");
            } else {
                setHistIdx(ni);
                setInput(history[ni]);
            }
        }
    };

    return (
        <>
            <div id="window-header">
                <WindowsControls target="terminal" />
                <h2><Penguin />Terminal</h2>
            </div>

            <div
                className="terminal-lines"
                ref={linesRef}
                onClick={() => inputRef.current?.focus()}
            >
                {lines.map((line) => (
                    line.kind === "stack" ? (
                        <div key={line.id} className="terminal-stack">
                            {techStack.map((group) => (
                                <div key={group.category} className="terminal-stack-group">
                                    <span className="terminal-stack-cat">{group.category}</span>
                                    <div className="terminal-stack-items">
                                        {group.items.map((item) => (
                                            <span
                                                key={item}
                                                className="terminal-stack-chip"
                                                title={skillMeta[item] ? `${item} — ${skillMeta[item].category}` : item}
                                            >
                                                {skillMeta[item]?.logo && (
                                                    <img src={skillMeta[item].logo} alt="" loading="lazy" />
                                                )}
                                                <span>{item}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : line.kind === "help" ? (
                        <div key={line.id} className="terminal-line help">
                            <span className="help-cmd">{line.cmd.padEnd(20)}</span>
                            <span className="help-desc">{line.desc}</span>
                        </div>
                    ) : (
                        <div key={line.id} className={`terminal-line ${line.kind}`}>
                            {line.content}
                        </div>
                    )
                ))}
            </div>

            <div className="terminal-input-line">
                <span className="terminal-prompt">adam@jemmali:~$</span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    spellCheck={false}
                    autoComplete="off"
                    aria-label="Terminal input"
                    placeholder='type "help"'
                />
            </div>
        </>
    );
};

const TerminalWindow = WindowWrapper(Terminal, "terminal");
export default TerminalWindow;

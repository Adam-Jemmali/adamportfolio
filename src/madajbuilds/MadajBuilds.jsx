import { useEffect, useMemo, useRef, useState } from "react";
import { getCapsule } from "@wenhaoqi/wasm_design_utils/squircle";
import { ReactLenis } from "lenis/react";
import Hero3D from "./Hero3D.jsx";

const THEMES = [
    { key: "A", accent: "#5b6cff", accent2: "#22d3ee" },
    { key: "B", accent: "#22c55e", accent2: "#a3e635" },
    { key: "C", accent: "#fb7185", accent2: "#fbbf24" },
];

const PILL_W = 108;
const PILL_H = 34;

// A tiny self-contained WebAudio blip — no audio files, no external assets.
const useBeep = (enabled) => {
    const ctxRef = useRef(null);
    return () => {
        if (!enabled) return;
        try {
            ctxRef.current = ctxRef.current || new (window.AudioContext || window.webkitAudioContext)();
            const ctx = ctxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = 720;
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            osc.connect(gain).connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        } catch {
            /* audio unavailable — stay silent */
        }
    };
};

const BurstLines = ({ color }) => {
    const lines = useMemo(() => {
        const count = 46;
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const inner = 40 + Math.random() * 20;
            const outer = inner + 90 + Math.random() * 140;
            return {
                x1: 200 + Math.cos(angle) * inner,
                y1: 200 + Math.sin(angle) * inner,
                x2: 200 + Math.cos(angle) * outer,
                y2: 200 + Math.sin(angle) * outer,
                w: (Math.random() * 1.6 + 0.6).toFixed(2),
                o: (0.35 + Math.random() * 0.5).toFixed(2),
            };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [color]);

    return (
        <svg className="burst-lines" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {lines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={l.w} strokeLinecap="round" opacity={l.o} />
            ))}
        </svg>
    );
};

const Pill = ({ path, children, ...rest }) => (
    <button type="button" className="pill" {...rest}>
        <svg className="pill-bg" viewBox={`0 0 ${PILL_W} ${PILL_H}`} aria-hidden="true">
            {path && <path d={path} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />}
        </svg>
        <span className="pill-label mono">{children}</span>
    </button>
);

const MadajBuilds = () => {
    const [themeIndex, setThemeIndex] = useState(0);
    const [soundOn, setSoundOn] = useState(false);
    const [pillPath, setPillPath] = useState(null);
    const [clock, setClock] = useState("--:--:--");
    const [coords, setCoords] = useState("0000 X 0000 Y");
    const beep = useBeep(soundOn);
    const theme = THEMES[themeIndex];

    // Capsule pill shape for the nav toggles, generated once via the
    // OKLCH/squircle WASM utility instead of a plain CSS rounded rect.
    useEffect(() => {
        let alive = true;
        getCapsule(PILL_W, PILL_H, PILL_H / 2)
            .then((d) => { if (alive) setPillPath(d); })
            .catch(() => { /* falls back to the plain pill styling */ });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        document.documentElement.style.setProperty("--accent", theme.accent);
        document.documentElement.style.setProperty("--accent-2", theme.accent2);
    }, [theme]);

    useEffect(() => {
        const tick = () => {
            const d = new Date();
            const pad = (n) => String(n).padStart(2, "0");
            setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const onMove = (e) => {
            const pad = (n) => String(n).padStart(4, "0");
            setCoords(`${pad(Math.round(e.clientX))} X ${pad(Math.round(e.clientY))} Y`);
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    useEffect(() => {
        document.getElementById("mb-year").textContent = new Date().getFullYear();
    }, []);

    return (
        <ReactLenis root options={{ duration: 1.2, smoothWheel: true }}>
            <div className="grid-overlay" aria-hidden="true" />
            <span className="crosshair tl" aria-hidden="true" />
            <span className="crosshair tr" aria-hidden="true" />
            <span className="crosshair bl" aria-hidden="true" />
            <span className="crosshair br" aria-hidden="true" />

            <nav className="nav">
                <span className="nav-brand mono">MADAJ.BUILDS</span>
                <div className="nav-links">
                    <a className="mono" href="#contact" onMouseEnter={beep}>CONTACT</a>
                    <Pill path={pillPath} onClick={() => { setThemeIndex((i) => (i + 1) % THEMES.length); beep(); }}>
                        THEME[{theme.key}]
                    </Pill>
                    <Pill path={pillPath} onClick={() => { setSoundOn((s) => !s); beep(); }}>
                        SOUND[{soundOn ? "/" : "-"}]
                    </Pill>
                </div>
            </nav>

            <main>
                <section className="panel panel-hero">
                    <svg className="blob tl" viewBox="0 0 120 90" style={{ color: "#4ade80" }} aria-hidden="true">
                        <path fill="currentColor" d="M8 46 Q2 24 22 16 Q30 4 48 10 Q66 2 76 18 Q96 20 92 42 Q100 60 80 66 Q70 82 50 76 Q30 88 16 70 Q-2 66 8 46 Z" />
                    </svg>

                    <p className="eyebrow mono">Build &amp; ship. Fast, opinionated, occasionally unhinged.</p>

                    <Hero3D />

                    <p className="hero-word-label">madaj</p>

                    <p className="hero-sub">
                        This is Adam&apos;s build log &mdash; a scrappier, faster-moving corner of the
                        internet for testing ideas before they earn a spot on the main portfolio.
                    </p>
                </section>

                <section className="panel panel-two">
                    <svg className="gem" viewBox="0 0 200 260" aria-hidden="true">
                        <defs>
                            <linearGradient id="gemFace1" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#8ea2ff" />
                                <stop offset="100%" stopColor="#4c5bdb" />
                            </linearGradient>
                            <linearGradient id="gemFace2" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#5b6cff" />
                                <stop offset="100%" stopColor="#2a2f8f" />
                            </linearGradient>
                            <linearGradient id="gemFace3" x1="0" y1="1" x2="1" y2="0">
                                <stop offset="0%" stopColor="#c3ccff" />
                                <stop offset="100%" stopColor="#7c8bff" />
                            </linearGradient>
                        </defs>
                        <polygon points="100,4 150,60 118,140 82,140 50,60" fill="url(#gemFace3)" />
                        <polygon points="100,4 150,60 130,230 100,256" fill="url(#gemFace1)" />
                        <polygon points="100,4 50,60 70,230 100,256" fill="url(#gemFace2)" />
                    </svg>
                    <p className="eyebrow mono" style={{ position: "relative", zIndex: 2 }}>002 &mdash; momentum</p>
                    <h2 className="headline">SHIP WITH<br />MOMENTUM</h2>
                </section>

                <section className="panel panel-burst">
                    <BurstLines color={theme.accent2} />
                    <p className="eyebrow mono" style={{ color: "rgba(255,255,255,0.8)", position: "relative", zIndex: 2 }}>003 &mdash; velocity</p>
                    <h2 className="headline">BUILD FIRST,<br />POLISH LATER</h2>
                </section>

                <section className="panel panel-cta" id="contact">
                    <svg className="star" viewBox="0 0 40 40" style={{ color: "#fbbf24" }} aria-hidden="true">
                        <path fill="currentColor" d="M20 2 L24 15 L38 15 L27 24 L31 38 L20 29 L9 38 L13 24 L2 15 L16 15 Z" />
                    </svg>
                    <svg className="blob br" viewBox="0 0 120 90" style={{ color: "#f472b6" }} aria-hidden="true">
                        <path fill="currentColor" d="M8 46 Q2 24 22 16 Q30 4 48 10 Q66 2 76 18 Q96 20 92 42 Q100 60 80 66 Q70 82 50 76 Q30 88 16 70 Q-2 66 8 46 Z" />
                    </svg>

                    <p className="eyebrow mono">004 &mdash; say hi</p>
                    <h2 className="headline">LET&apos;S BUILD<br />SOMETHING SCRAPPY</h2>

                    <div className="cta-links mono">
                        <a href="mailto:adam.official.514@gmail.com">EMAIL</a>
                        <a href="https://github.com/Adam-Jemmali" target="_blank" rel="noopener noreferrer">GITHUB</a>
                        <a href="https://www.instagram.com/madaj_2/" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
                    </div>

                    <p className="footer-note mono">MADAJ.BUILDS &copy; <span id="mb-year" /></p>
                </section>
            </main>

            <div className="statusbar">
                <span className="mono">{clock}</span>
                <span className="mono">{coords}</span>
                <svg className="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <ellipse cx="12" cy="12" rx="4" ry="9" />
                    <path d="M3 12h18M4.5 7h15M4.5 17h15" />
                </svg>
            </div>
        </ReactLenis>
    );
};

export default MadajBuilds;

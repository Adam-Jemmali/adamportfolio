import { useEffect, useRef, useState } from "react";
import { getCapsule } from "@wenhaoqi/wasm_design_utils/squircle";
import { ReactLenis } from "lenis/react";
import Hero3D from "./Hero3D.jsx";
import OceanWave from "./OceanWave.jsx";
import WaterDrop from "./WaterDrop.jsx";
import ProfilePanel from "./ProfilePanel.jsx";
import { useScrollProgress } from "../utils/useScrollProgress.js";

const THEMES = [
    { key: "A", accent: "#5b6cff", accent2: "#22d3ee" },
    { key: "B", accent: "#22c55e", accent2: "#a3e635" },
    { key: "C", accent: "#fb7185", accent2: "#fbbf24" },
];

const PILL_W = 108;
const PILL_H = 34;

/* ── Falling SVG icons ────────────────────────────────────────────── */
const ICON_PATHS = [
    // sparkle
    "M12 2l2 7h7l-5.5 4.5 2 7L12 16l-5.5 4.5 2-7L3 9h7z",
    // bolt
    "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    // hexagon
    "M12 2l8.5 5v10L12 22 3.5 17V7z",
    // target
    "M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12zm0 3a3 3 0 100 6 3 3 0 000-6z",
    // triangle
    "M12 3L22 21H2z",
    // plus
    "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4z",
    // diamond
    "M12 2l8 10-8 10-8-10z",
    // star-4
    "M12 2l3 9h9l-7.5 5.5 3 9L12 20l-7.5 5.5 3-9L0 11h9z",
];

const ICON_COLORS = ["#5b9fff", "#22d3ee", "#34d399", "#facc15", "#f87171", "#a78bfa", "#fb923c", "#f472b6"];

// Generate falling icons deterministically at module scope
const FALLING_ICONS = Array.from({ length: 16 }, (_, i) => ({
    path: ICON_PATHS[i % ICON_PATHS.length],
    color: ICON_COLORS[i % ICON_COLORS.length],
    size: 28 + (((i * 7 + 3) % 45)),
    x: ((i * 137 + 42) % 100),
    delay: ((i * 1.3) % 12),
    duration: 8 + ((i * 2.7) % 8),
    rotate: ((i * 60) % 360),
}));

/* ── Rolling digit coordinates ────────────────────────────────────── */
function RollingDigit({ value, className = "" }) {
    return (
        <span className={`rolling-digit ${className}`} key={value}>
            {value}
        </span>
    );
}

function RollingCoords({ coords }) {
    const [xStr, yStr] = coords.split(" X ");
    if (!yStr) return <span className="mono">{coords}</span>;

    return (
        <span className="rolling-coords mono">
            {xStr.split("").map((ch, i) => (
                <RollingDigit key={`x${i}-${ch}`} value={ch} />
            ))}
            <span className="coords-sep">X</span>
            {yStr.replace(" Y", "").split("").map((ch, i) => (
                <RollingDigit key={`y${i}-${ch}`} value={ch} />
            ))}
            <span className="coords-sep">Y</span>
        </span>
    );
}

/* ── Hero-meta time computation ───────────────────────────────────── */
function getShanghaiTime() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
    }).formatToParts(now);
    const h = parts.find((p) => p.type === "hour")?.value ?? "00";
    const m = parts.find((p) => p.type === "minute")?.value ?? "00";
    return `${h}:${m}`;
}

/* ── Beep hook ────────────────────────────────────────────────────── */
const useBeep = (enabled) => {
    const ctxRef = useRef(null);
    return () => {
        if (!enabled) return;
        try {
            ctxRef.current =
                ctxRef.current ||
                new (window.AudioContext || window.webkitAudioContext)();
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
            /* silent */
        }
    };
};

/* ── BurstLines ─────────────────────────────────────────────────── */
const BURST_COUNT = 46;
const BURST_LINES = Array.from({ length: BURST_COUNT }, (_, i) => {
    const angle = (i / BURST_COUNT) * Math.PI * 2;
    const inner = 40 + (((i * 17 + 5) % 20));
    const outer = inner + 90 + (((i * 13 + 7) % 140));
    return {
        x1: 200 + Math.cos(angle) * inner,
        y1: 200 + Math.sin(angle) * inner,
        x2: 200 + Math.cos(angle) * outer,
        y2: 200 + Math.sin(angle) * outer,
        w: (((i * 7 + 3) % 16) / 10 + 0.6).toFixed(2),
        o: (((i * 11 + 2) % 50) / 100 + 0.35).toFixed(2),
    };
});

const BurstLines = ({ color }) => {
    const lines = BURST_LINES;

    return (
        <svg className="burst-lines" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {lines.map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={l.w} strokeLinecap="round" opacity={l.o} />
            ))}
        </svg>
    );
};

/* ── Pill ─────────────────────────────────────────────────────────── */
const Pill = ({ path, children, ...rest }) => (
    <button type="button" className="pill" {...rest}>
        <svg className="pill-bg" viewBox={`0 0 ${PILL_W} ${PILL_H}`} aria-hidden="true">
            {path && <path d={path} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />}
        </svg>
        <span className="pill-label mono">{children}</span>
    </button>
);

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════ */
const MadajBuilds = () => {
    const heroRef = useRef(null);
    const { scrollProgress, heroInView } = useScrollProgress(heroRef);

    // Theme persistence
    const [themeIndex, setThemeIndex] = useState(() => {
        try {
            const saved = localStorage.getItem("madaj-theme");
            return saved !== null ? parseInt(saved, 10) : 0;
        } catch {
            return 0;
        }
    });
    const [soundOn, setSoundOn] = useState(false);
    const [pillPath, setPillPath] = useState(null);
    const [clock, setClock] = useState("--:--:--");
    const [coords, setCoords] = useState("0000 X 0000 Y");
    const beep = useBeep(soundOn);
    const theme = THEMES[themeIndex];

    // Capsule pill shape from WASM
    useEffect(() => {
        let alive = true;
        getCapsule(PILL_W, PILL_H, PILL_H / 2)
            .then((d) => { if (alive) setPillPath(d); })
            .catch(() => {});
        return () => { alive = false; };
    }, []);

    // Apply theme CSS vars
    useEffect(() => {
        document.documentElement.style.setProperty("--accent", theme.accent);
        document.documentElement.style.setProperty("--accent-2", theme.accent2);
    }, [theme]);

    // Persist theme
    useEffect(() => {
        try {
            localStorage.setItem("madaj-theme", themeIndex.toString());
        } catch { /* localStorage unavailable */ }
    }, [themeIndex]);

    // Clock
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

    // Coords
    useEffect(() => {
        const onMove = (e) => {
            const pad = (n) => String(n).padStart(4, "0");
            setCoords(`${pad(Math.round(e.clientX))} X ${pad(Math.round(e.clientY))} Y`);
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    // Year
    useEffect(() => {
        const el = document.getElementById("mb-year");
        if (el) el.textContent = new Date().getFullYear();
    }, []);

    return (
        <ReactLenis root options={{ duration: 1.2, smoothWheel: true }}>
            {/* Background effects */}
            <OceanWave scrollProgress={scrollProgress} />
            <WaterDrop scrollProgress={scrollProgress} />

            {/* Grid overlay */}
            <div className="grid-overlay" aria-hidden="true" />
            <span className="crosshair tl" aria-hidden="true" />
            <span className="crosshair tr" aria-hidden="true" />
            <span className="crosshair bl" aria-hidden="true" />
            <span className="crosshair br" aria-hidden="true" />

            {/* Scroll progress bar */}
            <div
                className="scroll-progress-bar"
                style={{ transform: `scaleX(${scrollProgress})` }}
                aria-hidden="true"
            />

            {/* Nav */}
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
                {/* ── HERO ──────────────────────────────────────────── */}
                <section className="panel panel-hero" ref={heroRef}>
                    <svg className="blob tl" viewBox="0 0 120 90" style={{ color: "#22d3ee" }} aria-hidden="true">
                        <path fill="currentColor" d="M8 46 Q2 24 22 16 Q30 4 48 10 Q66 2 76 18 Q96 20 92 42 Q100 60 80 66 Q70 82 50 76 Q30 88 16 70 Q-2 66 8 46 Z" />
                    </svg>

                    {/* Hero info row: title + tagline + bio */}
                    <div className="hero-info" style={{
                        opacity: Math.max(0, 1 - scrollProgress * 1.2),
                        transform: `translateY(${-scrollProgress * 60}%) translateZ(${-scrollProgress * 80}px)`,
                    }}>
                        <div className="hero-info-col">
                            <h1 className="hero-title">
                                AI Engineering<br />&amp; AI automation
                            </h1>
                        </div>
                        <div className="hero-info-col hero-info-center">
                            <p className="hero-tagline">
                                Building AI systems<br />Learning in public.
                            </p>
                        </div>
                        <div className="hero-info-col hero-info-right">
                            <p className="hero-bio">
                                I&apos;m Haoqi Wen, leading Design Engineering and AI
                                exploration — engineering and AI at scale. Outside work, I
                                build design tools for team efficiency.
                            </p>
                        </div>
                    </div>

                    {/* 3D Canvas — absolutely positioned, behind headline */}
                    <div className="hero-canvas-wrap">
                        <Hero3D scrollProgress={scrollProgress} themeKey={theme.key} />
                    </div>

                    {/* Headline overlay */}
                    <div className="hero-headline" style={{
                        perspective: "900px",
                        opacity: 1 - scrollProgress * 1.5,
                        transform: `
                            perspective(900px)
                            rotateX(${scrollProgress * 35}deg)
                            translateZ(${-scrollProgress * 120}px)
                            translateY(${scrollProgress * 40}px)
                        `,
                    }}>
                        <h2 className="headline hero-headline-text">
                            I BRING<br />
                            DEPTH &amp; DISCIPLINE<br />
                            TO ENGINEERING WORK
                        </h2>
                    </div>

                    {/* Falling icons layer */}
                    <div className="falling-icons-layer" style={{
                        opacity: Math.max(0, 1 - scrollProgress * 2),
                        transform: `translateY(${-scrollProgress * 100}%)`,
                    }} aria-hidden="true">
                        {FALLING_ICONS.map((icon, i) => (
                            <svg
                                key={i}
                                className="falling-icon"
                                viewBox="0 0 24 24"
                                width={icon.size}
                                height={icon.size}
                                style={{
                                    left: `${icon.x}%`,
                                    animationDelay: `${icon.delay}s`,
                                    animationDuration: `${icon.duration}s`,
                                    color: icon.color,
                                    transform: `rotate(${icon.rotate}deg)`,
                                }}
                            >
                                <path fill="currentColor" d={icon.path} />
                            </svg>
                        ))}
                    </div>

                    {/* Hero-meta row at bottom of hero */}
                    <div className="hero-meta">
                        <span className="sb-item">
                            <svg className="weather-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            </svg>
                        </span>
                        <span className="sb-item mono">
                            GMT+8 CN {getShanghaiTime()} 27°C
                        </span>
                        <span className="sb-item sb-sep">/</span>
                        <span className="sb-item mono">
                            CAN {clock}
                        </span>
                        <span className="sb-item">
                            <RollingCoords coords={coords} />
                        </span>
                        <span className="sb-item">
                            <svg className="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" />
                                <ellipse cx="12" cy="12" rx="4" ry="9" />
                                <path d="M3 12h18M4.5 7h15M4.5 17h15" />
                            </svg>
                        </span>
                    </div>
                </section>

                {/* ── PANEL TWO: PROFILE ────────────────────────────── */}
                <section className="panel panel-two" style={{
                    opacity: Math.min(1, Math.max(0, (scrollProgress - 0.05) * 3)),
                    transform: `translateY(${Math.max(0, (1 - Math.min(1, (scrollProgress - 0.05) * 3)) * 40)}px)`,
                }}>
                    <ProfilePanel />
                </section>

                {/* ── PANEL THREE: BURST ────────────────────────────── */}
                <section className="panel panel-burst">
                    <BurstLines color={theme.accent2} />
                    <p className="eyebrow mono" style={{ color: "rgba(255,255,255,0.8)", position: "relative", zIndex: 2 }}>003 — velocity</p>
                    <h2 className="headline">BUILD FIRST,<br />POLISH LATER</h2>
                </section>

                {/* ── PANEL CTA ─────────────────────────────────────── */}
                <section className="panel panel-cta" id="contact">
                    <svg className="star" viewBox="0 0 40 40" style={{ color: "#fbbf24" }} aria-hidden="true">
                        <path fill="currentColor" d="M20 2 L24 15 L38 15 L27 24 L31 38 L20 29 L9 38 L13 24 L2 15 L16 15 Z" />
                    </svg>
                    <svg className="blob br" viewBox="0 0 120 90" style={{ color: "#f472b6" }} aria-hidden="true">
                        <path fill="currentColor" d="M8 46 Q2 24 22 16 Q30 4 48 10 Q66 2 76 18 Q96 20 92 42 Q100 60 80 66 Q70 82 50 76 Q30 88 16 70 Q-2 66 8 46 Z" />
                    </svg>

                    <p className="eyebrow mono">004 — say hi</p>
                    <h2 className="headline">LET&apos;S BUILD<br />SOMETHING SCRAPPY</h2>

                    <div className="cta-links mono">
                        <a href="mailto:adam.official.514@gmail.com">EMAIL</a>
                        <a href="https://github.com/Adam-Jemmali" target="_blank" rel="noopener noreferrer">GITHUB</a>
                        <a href="https://www.instagram.com/madaj_2/" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
                    </div>

                    <p className="footer-note mono">MADAJ.BUILDS &copy; <span id="mb-year" /></p>
                </section>
            </main>

            {/* Fixed status bar — fades in after hero scrolls past */}
            <div className={`statusbar ${heroInView ? "statusbar-hidden" : ""}`}>
                <span className="sb-item sb-left">
                    <svg className="weather-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </span>
                <span className="sb-item mono sb-left">
                    GMT+8 CN {getShanghaiTime()} 27°C
                </span>
                <span className="sb-item sb-sep sb-left">/</span>
                <span className="sb-item mono sb-left">
                    CAN {clock}
                </span>
                <span className="sb-item sb-right">
                    <RollingCoords coords={coords} />
                </span>
                <span className="sb-item sb-right">
                    <svg className="globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <ellipse cx="12" cy="12" rx="4" ry="9" />
                        <path d="M3 12h18M4.5 7h15M4.5 17h15" />
                    </svg>
                </span>
            </div>
        </ReactLenis>
    );
};

export default MadajBuilds;

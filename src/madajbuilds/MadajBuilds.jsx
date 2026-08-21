import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getCapsule } from "@wenhaoqi/wasm_design_utils/squircle";
import { ReactLenis } from "lenis/react";
import Hero3D from "./Hero3D.jsx";
import OceanWave from "./OceanWave.jsx";
import WaterDrop from "./WaterDrop.jsx";
import ProfilePanel from "./ProfilePanel.jsx";
import { useScrollProgress } from "../utils/useScrollProgress.js";

// Keep GSAP advancing on wall-clock time when rAF is throttled (the Preview
// tab throttles requestAnimationFrame), so the intro can't stall.
gsap.ticker.lagSmoothing(0);

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

// Generate falling icons deterministically at module scope.
// Each icon gets its own tumble speed, starting angle, drift, and depth
// (depth drives the parallax scale/blur/speed).
const FALLING_ICONS = Array.from({ length: 34 }, (_, i) => ({
    path: ICON_PATHS[i % ICON_PATHS.length],
    color: ICON_COLORS[i % ICON_COLORS.length],
    size: 16 + (((i * 7 + 3) % 60)),
    x: ((i * 137 + 42) % 96),
    delay: ((i * 1.1 + 0.3) % 7),
    drift: (((i * 29 + 11) % 26) - 13),
    startAngle: ((i * 61 + 17) % 360),
    spin: (((i * 53 + 7) % 220) - 110),
    tumble: 0.6 + (((i * 41 + 3) % 100) / 100),
    // Wider depth bands: far (~0.05, small/blurry/slow) -> near (~1.05+, big/sharp/fast)
    depth: 0.05 + (((i * 37 + 11) % 105) / 100),
}));

/* ── Cloud seat puffs ─────────────────────────────────────────────── */
const CLOUD_PUFFS = [
    { cx: 100, cy: 50, rx: 90, ry: 20, squash: 0.14 }, // wide base — barely dents
    { cx: 45, cy: 34, rx: 38, ry: 24, squash: 0.4 },
    { cx: 100, cy: 24, rx: 42, ry: 28, squash: 0.4 },
    { cx: 150, cy: 36, rx: 34, ry: 22, squash: 0.4 },
];

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

/* ── Falling 3D icons with parallax depth ─────────────────────────── */
function FallingIcons({ scrollProgress, wordmarkRectRef }) {
    const layerRef = useRef(null);
    const iconElsRef = useRef([]);

    useEffect(() => {
        const els = iconElsRef.current;
        if (!els.length) return;

        // Per-icon runtime state. Depth drives parallax: near icons fall
        // faster, render larger and sharper; far icons fall slower, smaller, blurrier.
        const items = FALLING_ICONS.map((icon, i) => {
            const speed = 20 + icon.depth * 60;
            const scale = 0.55 + icon.depth * 0.75;
            const blur = Math.max(0, 1 - icon.depth) * 3;
            return {
                el: els[i],
                x: icon.x,
                y: -80 - speed * icon.delay,
                vx: icon.drift,
                vy: speed,
                rot: icon.startAngle,
                rotV: icon.spin,
                tumble: icon.tumble,
                scale,
                blur,
                depth: icon.depth,
                size: icon.size,
                // gentle horizontal sway while falling
                swayAmp: 6 + ((i * 37 + 5) % 22),
                swayFreq: 0.4 + ((i * 23 + 7) % 90) / 100,
                swayPhase: ((i * 17 + 3) % 63) / 10,
                sway: 0,
            };
        });

        let last = performance.now();

        const tick = () => {
            const now = performance.now();
            const dt = Math.min((now - last) / 1000, 2);
            last = now;
            const H = window.innerHeight;
            const layer = layerRef.current;
            const lr = layer ? layer.getBoundingClientRect() : { left: 0, top: 0, width: H };

            // Headline text lines ("I BRING / DEPTH & DISCIPLINE / TO ENGINEERING WORK")
            const headlineTargets = [];
            const headline = document.querySelector(".hero-headline-text");
            if (headline) {
                const range = document.createRange();
                range.selectNodeContents(headline);
                for (const r of Array.from(range.getClientRects())) {
                    if (r.width > 4 && r.height > 4) headlineTargets.push(r);
                }
            }

            for (const it of items) {
                // Gentle horizontal sway
                it.swayPhase += it.swayFreq * dt;
                it.sway = Math.sin(it.swayPhase) * it.swayAmp;

                it.rot += it.rotV * dt;
                it.y += it.vy * dt;
                it.x += it.vx * dt;

                // Respawn above once it clears the bottom
                if (it.y > H + 80) {
                    it.y = -80;
                    it.x = 4 + Math.random() * 92;
                }
                if (it.x < 2) { it.x = 2; it.vx = Math.abs(it.vx); }
                else if (it.x > 98) { it.x = 98; it.vx = -Math.abs(it.vx); }

                const half = (it.size * it.scale) / 2;
                const rx = (it.x / 100) * lr.width + it.sway;
                const ry = it.y;
                const z = it.scale * 90;
                const vpx = rx + lr.left;
                const vpy = ry + lr.top;

                // Soft fade in/out at the screen edges
                let opacity = 0.4;
                if (it.y < 0) opacity = Math.max(0, 0.4 * (1 + it.y / 90));
                else if (it.y > H - 90) opacity = Math.max(0, 0.4 * ((H - it.y) / 90));

                // Fade slightly while passing behind the 3D wordmark letters.
                // Nearer icons dim less, farther icons dim more (layered depth).
                const wmRects = wordmarkRectRef ? wordmarkRectRef.current : null;
                if (wmRects && wmRects.length) {
                    const margin = 22;
                    const dim = 0.6 - it.depth * 0.4;
                    let wmFade = 1;
                    for (const r of wmRects) {
                        const insideX = Math.min(vpx - (r.left - margin), (r.right + margin) - vpx);
                        const insideY = Math.min(vpy - (r.top - margin), (r.bottom + margin) - vpy);
                        const inside = Math.min(insideX, insideY);
                        if (inside > 0) {
                            const t = Math.min(1, inside / margin);
                            wmFade = Math.min(wmFade, 1 - dim * t);
                        }
                    }
                    opacity *= wmFade;
                }

                // Same soft fade behind the "I BRING…" headline text lines.
                if (headlineTargets.length) {
                    const margin = 22;
                    let hFade = 1;
                    for (const r of headlineTargets) {
                        const insideX = Math.min(vpx - (r.left - margin), (r.right + margin) - vpx);
                        const insideY = Math.min(vpy - (r.top - margin), (r.bottom + margin) - vpy);
                        const inside = Math.min(insideX, insideY);
                        if (inside > 0) {
                            const t = Math.min(1, inside / margin);
                            hFade = Math.min(hFade, 1 - 0.5 * t);
                        }
                    }
                    opacity *= hFade;
                }

                it.el.style.transform =
                    `translate3d(${(rx - half).toFixed(1)}px, ${(ry - half).toFixed(1)}px, ${z.toFixed(1)}px) ` +
                    `rotateX(${(it.rot * it.tumble).toFixed(2)}deg) ` +
                    `rotateY(${(it.rot * it.tumble * 0.7).toFixed(2)}deg) ` +
                    `rotateZ(${it.rot.toFixed(2)}deg) scale(${it.scale.toFixed(3)})`;
                it.el.style.opacity = opacity.toFixed(3);
                it.el.style.filter = it.blur > 0.02 ? `blur(${it.blur.toFixed(2)}px)` : "none";
            }
        };

        const interval = setInterval(tick, 16);
        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={layerRef} className="falling-icons-layer" aria-hidden="true" style={{
            opacity: Math.max(0, 1 - scrollProgress * 2),
            transform: `translateY(${-scrollProgress * 100}%)`,
        }}>
            {FALLING_ICONS.map((icon, i) => (
                <svg
                    key={i}
                    ref={(el) => { iconElsRef.current[i] = el; }}
                    className="falling-icon"
                    viewBox="0 0 24 24"
                    width={icon.size}
                    height={icon.size}
                    style={{ color: icon.color }}
                >
                    <path fill="currentColor" d={icon.path} />
                </svg>
            ))}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════ */
const MadajBuilds = () => {
    const heroRef = useRef(null);
    const wordmarkRectRef = useRef(null);
    const titleCloudRef = useRef(null);
    const titleRef = useRef(null);
    const cloudRef = useRef(null);
    const puffRefs = useRef([]);
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

    // Title-sits-on-cloud animation: gravity drop → squash → rebound → settle,
    // plus a jelly cloud that dents under the pointer and a click-to-bounce.
    useGSAP(() => {
        const title = titleRef.current;
        const cloud = cloudRef.current;
        const wrapper = titleCloudRef.current;
        const puffs = puffRefs.current;
        if (!title || !cloud || !wrapper || puffs.length !== CLOUD_PUFFS.length) return;

        gsap.set(title, { transformOrigin: "50% 50%" });
        gsap.set(cloud, { transformOrigin: "50% 100%" });

        let settled = false;
        let hovering = false;
        let bouncing = false;
        let idle = null;

        const startIdle = () => {
            if (hovering || bouncing) return; // jelly/bounce active — resume on leave/complete
            if (idle) idle.kill();
            idle = gsap.to(cloud, {
                scaleY: 1.05,
                scaleX: 0.95,
                duration: 1.6,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });
        };

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(title, { y: 0, autoAlpha: 1 });
            gsap.set(cloud, { scaleX: 1, scaleY: 1 });
            settled = true;
            return;
        }

        // Gravity drop → impact squash → rebound → settle
        gsap
            .timeline()
            .fromTo(
                title,
                { y: -46, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.55, ease: "power2.in" }
            )
            .to(cloud, { scaleY: 0.7, scaleX: 1.32, duration: 0.13, ease: "power2.in" }, ">")
            .to(title, { y: 5, duration: 0.13, ease: "power2.in" }, "<")
            .to(cloud, { scaleY: 1.09, scaleX: 0.92, duration: 0.34, ease: "power2.out" }, ">")
            .to(title, { y: -8, duration: 0.34, ease: "power2.out" }, "<")
            .to(cloud, { scaleY: 1, scaleX: 1, duration: 0.45, ease: "elastic.out(1, 0.4)" }, ">")
            .to(title, { y: 0, duration: 0.45, ease: "elastic.out(1, 0.4)" }, "<")
            .add(() => {
                settled = true;
                startIdle();
            });

        const dentPuffs = (clientX) => {
            const rect = cloud.getBoundingClientRect();
            if (!rect.width) return;
            // Pointer x mapped into the 0–200 viewBox coordinate space.
            const vx = ((clientX - rect.left) / rect.width) * 200;
            CLOUD_PUFFS.forEach((p, i) => {
                const d = Math.abs(vx - p.cx);
                let w = Math.max(0, 1 - d / 62);
                w = w * w * (3 - 2 * w); // smoothstep falloff
                // Squash the puff's vertical radius while planting its bottom
                // edge (cy + ry stays fixed) so it dents downward like jelly.
                const ry = p.ry * (1 - p.squash * w);
                const cy = p.cy + (p.ry - ry);
                const rx = p.rx * (1 + p.squash * 0.4 * w);
                gsap.to(puffs[i], {
                    attr: { ry, cy, rx },
                    duration: 0.15,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            });
        };

        const resetPuffs = () => {
            CLOUD_PUFFS.forEach((p, i) => {
                gsap.to(puffs[i], {
                    attr: { ry: p.ry, cy: p.cy, rx: p.rx },
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            });
        };

        const onEnter = () => {
            if (!settled) return;
            hovering = true;
            if (idle) idle.kill();
        };

        const onMove = (e) => {
            if (!settled || bouncing) return;
            dentPuffs(e.clientX);
        };

        const onLeave = () => {
            if (!settled) return;
            hovering = false;
            resetPuffs();
            startIdle();
        };

        const onBounce = () => {
            if (!settled || bouncing) return;
            bouncing = true;
            if (idle) idle.kill();
            resetPuffs();

            gsap
                .timeline({ onComplete: () => { bouncing = false; startIdle(); } })
                .to(title, { y: -52, duration: 0.42, ease: "power2.out" })
                .to(title, { y: 0, duration: 0.42, ease: "power2.in" })
                .to(cloud, { scaleY: 0.62, scaleX: 1.38, duration: 0.14, ease: "power2.in" }, ">")
                .to(title, { y: 8, duration: 0.14, ease: "power2.in" }, "<")
                .to(cloud, { scaleY: 1.1, scaleX: 0.9, duration: 0.4, ease: "power2.out" }, ">")
                .to(title, { y: -12, duration: 0.4, ease: "power2.out" }, "<")
                .to(cloud, { scaleY: 1, scaleX: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }, ">")
                .to(title, { y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }, "<");
        };

        wrapper.addEventListener("pointerenter", onEnter);
        wrapper.addEventListener("pointermove", onMove);
        wrapper.addEventListener("pointerleave", onLeave);
        wrapper.addEventListener("click", onBounce);

        return () => {
            if (idle) idle.kill();
            wrapper.removeEventListener("pointerenter", onEnter);
            wrapper.removeEventListener("pointermove", onMove);
            wrapper.removeEventListener("pointerleave", onLeave);
            wrapper.removeEventListener("click", onBounce);
        };
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
                    {/* Hero info row: title + tagline + bio */}
                    <div className="hero-info" style={{
                        opacity: Math.max(0, 1 - scrollProgress * 1.2),
                        transform: `translateY(${-scrollProgress * 60}%) translateZ(${-scrollProgress * 80}px)`,
                    }}>
                        <div className="hero-info-col">
                            <div className="title-on-cloud" ref={titleCloudRef}>
                                <h1 className="hero-title" ref={titleRef}>
                                    AI Engineering<br />&amp; AI automation
                                </h1>
                                <svg className="cloud-seat" viewBox="0 0 200 70" preserveAspectRatio="none" ref={cloudRef} aria-hidden="true">
                                    <g fill="currentColor">
                                        {CLOUD_PUFFS.map((p, i) => (
                                            <ellipse
                                                key={i}
                                                className="cloud-puff"
                                                cx={p.cx}
                                                cy={p.cy}
                                                rx={p.rx}
                                                ry={p.ry}
                                                ref={(el) => { puffRefs.current[i] = el; }}
                                            />
                                        ))}
                                    </g>
                                </svg>
                            </div>
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
                        <Hero3D scrollProgress={scrollProgress} themeKey={theme.key} wordmarkRectRef={wordmarkRectRef} />
                    </div>

                    {/* Headline overlay */}
                    <div className="hero-headline" style={{
                        opacity: Math.max(0, 1 - scrollProgress * 1.3),
                        transform: `translateY(${-scrollProgress * 70}px) rotateX(${scrollProgress * 25}deg)`,
                    }}>
                        <h2 className="headline hero-headline-text">
                            I BRING<br />
                            DEPTH &amp; DISCIPLINE<br />
                            TO ENGINEERING WORK
                        </h2>
                    </div>

                    {/* Falling icons layer */}
                    <FallingIcons scrollProgress={scrollProgress} wordmarkRectRef={wordmarkRectRef} />

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

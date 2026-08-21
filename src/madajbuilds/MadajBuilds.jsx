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

/* ── Textured badge icons ─────────────────────────────────────────── */
// CSS-rendered badges replace the old line-art SVGs. Each has a colored,
// grainy circular face, a pale rim, and a dark hand-drawn-style symbol.
const BADGE_ICONS = [
    { kind: "orbit", color: "#ffad38", ink: "#172333" },
    { kind: "leaf", color: "#9bd85c", ink: "#1d3020" },
    { kind: "spark", color: "#f66c8a", ink: "#321a28" },
    { kind: "wave", color: "#5dbde4", ink: "#102b3b" },
    { kind: "flower", color: "#b78ee7", ink: "#281a3c" },
    { kind: "eye", color: "#f3c84b", ink: "#332b14" },
    { kind: "mountain", color: "#ef8862", ink: "#392019" },
    { kind: "planet", color: "#65c7b4", ink: "#11302d" },
    { kind: "bolt", color: "#e86e5c", ink: "#321d1a" },
    { kind: "smile", color: "#f0a7c8", ink: "#3a1d2c" },
];

const FALLING_ICONS = Array.from({ length: 34 }, (_, i) => ({
    badge: BADGE_ICONS[i % BADGE_ICONS.length],
    size: 30 + (((i * 7 + 3) % 38)),
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
// Keep the cloud as separate puffs so pressure can be applied at the exact
// horizontal pointer position instead of squashing the whole cloud uniformly.
const CLOUD_PUFFS = [
    { cx: 100, cy: 50, rx: 90, ry: 20, squash: 0.14 },
    { cx: 45, cy: 34, rx: 38, ry: 24, squash: 0.42 },
    { cx: 100, cy: 24, rx: 42, ry: 28, squash: 0.46 },
    { cx: 150, cy: 36, rx: 34, ry: 22, squash: 0.42 },
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

/* ── Bent hero title ──────────────────────────────────────────────── */
function BentTitleLine({ text, curve = 9 }) {
    const chars = Array.from(text);
    const denominator = Math.max(chars.length - 1, 1);

    return (
        <span className="hero-title-line" aria-hidden="true">
            {chars.map((char, i) => {
                const position = (i / denominator) * 2 - 1;
                const y = curve * position * position - curve * 0.35;
                const rotation = position * 7;
                return (
                    <span
                        className="hero-title-char"
                        key={`${char}-${i}`}
                        style={{
                            "--bend-y": `${y.toFixed(2)}px`,
                            "--bend-rotation": `${rotation.toFixed(2)}deg`,
                        }}
                    >
                        {char === " " ? "\u00a0" : char}
                    </span>
                );
            })}
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
    const scrollProgressRef = useRef(scrollProgress);

    useEffect(() => {
        scrollProgressRef.current = scrollProgress;
    }, [scrollProgress]);

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

                // As the hero leaves, pull badges into the side vacuum instead
                // of simply hiding them. The curved pull gives the transition
                // a physical, sucked-away feeling while remaining reversible.
                const vacuumProgress = Math.max(0, Math.min(1, (scrollProgressRef.current - 0.18) / 0.68));
                if (vacuumProgress > 0) {
                    const pull = vacuumProgress * vacuumProgress;
                    it.x += (101 - it.x) * pull * dt * 1.65;
                    it.y += (H * 0.5 - it.y) * pull * dt * 0.85;
                    it.rot += pull * 180 * dt;
                }

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
                opacity *= 1 - Math.min(0.86, vacuumProgress * 0.86);

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
                <div
                    key={i}
                    ref={(el) => { iconElsRef.current[i] = el; }}
                    className={`falling-icon falling-badge falling-badge-${icon.badge.kind}`}
                    style={{
                        width: icon.size,
                        height: icon.size,
                        "--badge-color": icon.badge.color,
                        "--badge-ink": icon.badge.ink,
                    }}
                    aria-hidden="true"
                >
                    <span className="falling-badge-symbol" />
                </div>
            ))}
        </div>
    );
}

/* ── Side vacuum transition ─────────────────────────────────────── */
const VACUUM_STREAMS = Array.from({ length: 9 }, (_, i) => ({
    angle: -34 + i * 8,
    delay: `${(i * 0.11).toFixed(2)}s`,
    width: `${72 + ((i * 17) % 64)}px`,
}));

function VacuumTransition({ scrollProgress }) {
    const progress = Math.max(0, Math.min(1, (scrollProgress - 0.16) / 0.76));
    const visibility = Math.sin(progress * Math.PI);

    return (
        <div
            className="vacuum-transition"
            aria-hidden="true"
            style={{
                opacity: visibility,
                "--vacuum-progress": progress,
            }}
        >
            <div className="vacuum-streams">
                {VACUUM_STREAMS.map((stream, i) => (
                    <span
                        className="vacuum-stream"
                        key={i}
                        style={{
                            "--stream-angle": `${stream.angle}deg`,
                            "--stream-delay": stream.delay,
                            "--stream-width": stream.width,
                        }}
                    />
                ))}
            </div>
            <div className="vacuum-mouth">
                <span className="vacuum-ring vacuum-ring-outer" />
                <span className="vacuum-ring vacuum-ring-inner" />
                <span className="vacuum-core" />
            </div>
            <span className="vacuum-particle vacuum-particle-a" />
            <span className="vacuum-particle vacuum-particle-b" />
            <span className="vacuum-particle vacuum-particle-c" />
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
    const cloudLadderRef = useRef(null);
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

    // Title-on-cloud animation: pointer pressure dents the nearest puff, while
    // clicking launches the title into a taller jelly bounce.
    useGSAP(() => {
        const title = titleRef.current;
        const cloud = cloudRef.current;
        const wrapper = titleCloudRef.current;
        const puffs = puffRefs.current;
        if (!title || !cloud || !wrapper || puffs.length !== CLOUD_PUFFS.length) return;

        gsap.set(title, { transformOrigin: "50% 100%" });
        gsap.set(cloud, { transformOrigin: "50% 100%" });

        let settled = false;
        let bouncing = false;
        let idle = null;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const resetPuffs = (duration = 0.3) => {
            CLOUD_PUFFS.forEach((p, i) => {
                gsap.to(puffs[i], {
                    attr: { cx: p.cx, cy: p.cy, rx: p.rx, ry: p.ry },
                    duration,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            });
        };

        const dentPuffs = (clientX, strength = 0.78) => {
            const rect = cloud.getBoundingClientRect();
            if (!rect.width) return;

            // Map the viewport pointer to the cloud's 0–200 SVG coordinate.
            // The smooth falloff keeps the pressed spot soft while preserving
            // a clearly local dent rather than flattening the whole cloud.
            const pointerX = Math.max(0, Math.min(200, ((clientX - rect.left) / rect.width) * 200));
            CLOUD_PUFFS.forEach((p, i) => {
                const distance = Math.abs(pointerX - p.cx);
                const influence = Math.max(0, 1 - distance / 62);
                const weight = influence * influence * (3 - 2 * influence);
                const amount = p.squash * strength * weight;
                const ry = p.ry * (1 - amount);
                const cy = p.cy + (p.ry - ry);
                const rx = p.rx * (1 + amount * 0.5);

                gsap.to(puffs[i], {
                    attr: { cy, ry, rx },
                    duration: strength > 0.9 ? 0.1 : 0.16,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            });
        };

        const startIdle = () => {
            if (idle) idle.kill();
            if (bouncing) return;
            idle = gsap.to(cloud, {
                scaleY: 1.04,
                scaleX: 0.96,
                duration: 1.7,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });
        };

        const settleAfterBounce = () => {
            bouncing = false;
            resetPuffs(0.28);
            startIdle();
        };

        if (reducedMotion) {
            gsap.set(title, { y: 0, autoAlpha: 1 });
            gsap.set(cloud, { scaleX: 1, scaleY: 1 });
            settled = true;
        } else {
            // Gravity drop → impact squash → rebound → settle.
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
        }

        const onMove = (event) => {
            if (!settled || bouncing || event.pointerType === "touch") return;
            if (idle) idle.kill();
            dentPuffs(event.clientX);
        };

        const onPointerDown = (event) => {
            if (!settled || bouncing) return;
            if (idle) idle.kill();
            dentPuffs(event.clientX, 1);
        };

        const onLeave = () => {
            if (!settled || bouncing) return;
            resetPuffs();
            gsap.to(cloud, {
                scaleX: 1,
                scaleY: 1,
                duration: 0.35,
                ease: "elastic.out(1, 0.35)",
                onComplete: startIdle,
            });
        };

        const onBounce = (event) => {
            if (!settled || reducedMotion) return;
            if (idle) idle.kill();
            bouncing = true;
            dentPuffs(event.clientX, 1);
            gsap.killTweensOf([title, cloud]);

            gsap
                .timeline({ onComplete: settleAfterBounce })
                // A click is a local impact, followed by a much higher launch.
                .to(cloud, {
                    scaleY: 0.62,
                    scaleX: 1.36,
                    duration: 0.13,
                    ease: "power2.in",
                })
                .to(title, { y: -112, duration: 0.42, ease: "power2.out" }, "<")
                .to(cloud, {
                    scaleY: 1.12,
                    scaleX: 0.9,
                    duration: 0.3,
                    ease: "power2.out",
                }, ">-0.04")
                .to(title, { y: 7, duration: 0.42, ease: "bounce.out" }, ">")
                .to(cloud, {
                    scaleY: 1,
                    scaleX: 1,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.4)",
                }, "<")
                .to(title, { y: 0, duration: 0.18, ease: "power2.out" }, ">-0.08");
        };

        wrapper.addEventListener("pointermove", onMove);
        wrapper.addEventListener("pointerdown", onPointerDown);
        wrapper.addEventListener("pointerleave", onLeave);
        wrapper.addEventListener("click", onBounce);

        return () => {
            if (idle) idle.kill();
            gsap.killTweensOf([...puffs, title, cloud]);
            wrapper.removeEventListener("pointermove", onMove);
            wrapper.removeEventListener("pointerdown", onPointerDown);
            wrapper.removeEventListener("pointerleave", onLeave);
            wrapper.removeEventListener("click", onBounce);
        };
    }, []);

    /* ── Cloud + ladder climbing animation ───────────────────────── */
    useGSAP(() => {
        const scene = cloudLadderRef.current;
        if (!scene) return;

        const ladder = scene.querySelector(".scene-ladder");
        const climbText = scene.querySelector(".scene-climb-text");
        const cloudWrap = scene.querySelector(".scene-cloud-wrap");
        const cloudLabel = scene.querySelector(".scene-cloud-label");
        if (!ladder || !climbText || !cloudWrap) return;

        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
            gsap.set(ladder, { opacity: 1, rotate: -30 });
            gsap.set(climbText, { opacity: 1, y: -80 });
            return;
        }

        const tl = gsap.timeline({ delay: 1.6, repeat: -1, repeatDelay: 3 });

        // Reset cloud and label at start
        tl.set(cloudWrap, { scaleX: 1, scaleY: 1 });
        if (cloudLabel) tl.set(cloudLabel, { textContent: "FOLLOW" });

        // Ladder slides in from the right
        tl.fromTo(ladder,
            { opacity: 0, x: 60, rotate: 0 },
            { opacity: 1, x: 0, rotate: -30, duration: 0.6, ease: "power2.out" }
        );

        // @madajbuilds appears at bottom of ladder and climbs up
        tl.fromTo(climbText,
            { opacity: 0, y: 0, x: 0, rotation: 30, transformOrigin: "left center" },
            { opacity: 1, duration: 0.15, ease: "none" },
            "-=0.1"
        );
        // Climb to top of ladder
        tl.to(climbText, {
            y: -88,
            x: 40,
            duration: 1.2,
            ease: "power1.inOut",
        });

        // Pre-calculate offset from climbText position to cloud center
        const textEnd = climbText.getBoundingClientRect();
        const cloudEnd = cloudWrap.getBoundingClientRect();
        const deltaX = (cloudEnd.left + cloudEnd.width / 2) - (textEnd.left + textEnd.width / 2);
        const deltaY = (cloudEnd.top + cloudEnd.height / 2) - (textEnd.top + textEnd.height / 2);

        // Fly from ladder top into the cloud
        tl.to(climbText, {
            x: "+=" + deltaX,
            y: "+=" + deltaY,
            rotation: 0,
            duration: 0.8,
            ease: "power2.inOut",
        });

        // Cloud bounces on arrival
        tl.to(cloudWrap, {
            scaleX: 1.3,
            scaleY: 0.75,
            duration: 0.12,
            ease: "power2.in",
        }, "-=0.15");
        tl.to(cloudWrap, {
            scaleX: 0.9,
            scaleY: 1.15,
            duration: 0.25,
            ease: "power2.out",
        });
        tl.to(cloudWrap, {
            scaleX: 1.05,
            scaleY: 0.95,
            duration: 0.18,
            ease: "power2.out",
        });
        tl.to(cloudWrap, {
            scaleX: 1,
            scaleY: 1,
            duration: 0.3,
            ease: "elastic.out(1, 0.4)",
        });

        // Update label to include @madajbuilds
        if (cloudLabel) {
            tl.call(() => { cloudLabel.textContent = "FOLLOW @madajbuilds"; }, null, "-=0.6");
        }

        // Fade text as it merges into cloud
        tl.to(climbText, {
            opacity: 0,
            scale: 0.3,
            duration: 0.25,
            ease: "power1.in",
        }, "-=0.8");

        // Ladder retreats
        tl.to(ladder, {
            opacity: 0,
            x: 60,
            rotate: 0,
            duration: 0.4,
            ease: "power2.in",
        }, ">+0.15");

        return () => { tl.kill(); };
    }, []);

    return (
        <ReactLenis root options={{ duration: 1.2, smoothWheel: true }}>
            {/* Background effects */}
            <OceanWave scrollProgress={scrollProgress} />
            <WaterDrop scrollProgress={scrollProgress} />
            <VacuumTransition scrollProgress={scrollProgress} />

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
                                <h1
                                    className="hero-title"
                                    ref={titleRef}
                                    aria-label="AI Engineering and AI automation"
                                >
                                    <BentTitleLine text="AI Engineering" curve={10} />
                                    <BentTitleLine text="& AI automation" curve={8} />
                                </h1>
                                <svg className="cloud-seat" viewBox="0 0 200 70" preserveAspectRatio="none" ref={cloudRef} aria-hidden="true">
                                    <g fill="currentColor">
                                        {CLOUD_PUFFS.map((puff, i) => (
                                            <ellipse
                                                key={i}
                                                cx={puff.cx}
                                                cy={puff.cy}
                                                rx={puff.rx}
                                                ry={puff.ry}
                                                ref={(element) => { puffRefs.current[i] = element; }}
                                            />
                                        ))}
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <div className="hero-info-col hero-info-center">
                            <p className="hero-tagline">
                                Building AI systems<br />Learning in public
                            </p>
                        </div>
                        <div className="hero-info-col hero-info-right flex justify-center text-center">
                            <p className="hero-bio">
                                Exploring AI, sports tech &amp; edtech, <br />building systems that ship.
                                
                            </p>

                            {/* ── Cloud + ladder scene ───────────────────── */}
                            <div className="cloud-ladder-scene" ref={cloudLadderRef}>
                                {/* Cloud with FOLLOW text */}
                                <div className="scene-cloud-wrap">
                                    <svg className="scene-cloud" viewBox="0 0 200 70" preserveAspectRatio="none">
                                        <g fill="currentColor">
                                            <ellipse cx="100" cy="50" rx="90" ry="20" />
                                            <ellipse cx="45" cy="34" rx="38" ry="24" />
                                            <ellipse cx="100" cy="24" rx="42" ry="28" />
                                            <ellipse cx="150" cy="36" rx="34" ry="22" />
                                        </g>
                                    </svg>
                                    <span className="scene-cloud-label">FOLLOW</span>
                                </div>
                                {/* Inclined ladder from right */}
                                <div className="scene-ladder">
                                    <span className="s-rail s-rail-l" />
                                    <span className="s-rail s-rail-r" />
                                    <span className="s-rung" />
                                    <span className="s-rung" />
                                    <span className="s-rung" />
                                    <span className="s-rung" />
                                    <span className="s-rung" />
                                </div>
                                {/* Climbing text */}
                                <span className="scene-climb-text">@madajbuilds</span>
                            </div>
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

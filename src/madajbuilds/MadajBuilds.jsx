import { lazy, memo, Suspense, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ReactLenis } from "lenis/react";
import OceanWaveRaw from "./OceanWave.jsx";
import WaterDropRaw from "./WaterDrop.jsx";
import ProfilePanelRaw from "./ProfilePanel.jsx";
import { useScrollProgress } from "../utils/useScrollProgress.js";

// The 3D hero (three.js + opentype.js, ~0.5 MB gzipped) loads in its own
// async chunk so the page paints instantly and the wordmark streams in.
const Hero3D = memo(lazy(() => import("./Hero3D.jsx")));
// The CTA's balloon-script wordmark — same 3D look, loads on demand.
const CtaWord3D = memo(lazy(() => import("./CtaWord3D.jsx")));

// Memoise the expensive subtrees so cheap parent re-renders (clock ticking,
// cursor-coords updating) never reach the 3D canvas or the profile panel.
const OceanWave = memo(OceanWaveRaw);
const WaterDrop = memo(WaterDropRaw);
const ProfilePanel = memo(ProfilePanelRaw);

// Static capsule path for the nav pills (was a WASM call — pure load-time
// overhead for a shape that never changes). 108 × 34, radius 17.
const PILL_PATH = "M 17 0 L 91 0 A 17 17 0 0 1 91 34 L 17 34 A 17 17 0 0 1 17 0 Z";

// Fewer falling badges on low-core machines — same motion, lighter load.
const LOW_END =
    typeof navigator !== "undefined" &&
    ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4));

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

const FALLING_ICON_COUNT = LOW_END ? 16 : 34;
const FALLING_ICONS = Array.from({ length: FALLING_ICON_COUNT }, (_, i) => ({
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

// Cloud 2 puffs — same shape, separate refs for independent animation
const CLOUD2_PUFFS = [
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
        // 1..5 — each ray takes one of the theme-derived --ray-* hues
        // (accent, accent-2 and mixes) so the burst is a colour blend
        // that re-tints with themes A / B / C.
        c: ((i * 3 + 1) % 5) + 1,
    };
});

const BurstLines = ({ className = "" }) => (
    <svg className={`burst-lines ${className}`} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {BURST_LINES.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={`var(--ray-${l.c})`} strokeWidth={l.w} strokeLinecap="round" opacity={l.o} />
        ))}
    </svg>
);

/* ── Cursor arrow — a chunky extruded 3D pointer ───────────────────
   The silhouette is stacked as a deep run of Z-offset slices, each
   progressively darker, so it reads as a solid bulky volume and its
   thickness shows when it tumbles on any axis. All colours are driven
   by CSS custom props (--cur-*) so it re-tints with the theme. */
const CURSOR_PATH = "M30 15 L150 135 L96 135 L134 220 L108 229 L74 150 L30 178 Z";
// Chunky extrusion — matched to the hero's thick 3D pointer. A deep stack
// of slices forms the bulky side wall; it's lit bright near the face and
// falls off into shadow at the back so the volume reads as a rounded 3D
// body, not a flat dark slab.
const CURSOR_SLICES = LOW_END ? 30 : 54;
const CURSOR_SLICE_STEP = 6.5;

const CursorArrow = () => (
    <div className="cursor-3d" aria-hidden="true">
        {Array.from({ length: CURSOR_SLICES }, (_, i) => {
            const t = i / (CURSOR_SLICES - 1);            // 0 = at the face, 1 = deepest
            // bright rim just behind the face, easing down to a dark back
            const lit = 1.18 - t * 0.92;                  // 1.18 → 0.26
            return (
                <svg
                    key={i}
                    className="cursor-3d-slice"
                    viewBox="0 0 180 244"
                    style={{
                        transform: `translateZ(-${((i + 1) * CURSOR_SLICE_STEP).toFixed(1)}px)`,
                        filter: `brightness(${lit.toFixed(3)})`,
                        zIndex: CURSOR_SLICES - i,
                    }}
                >
                    <path d={CURSOR_PATH} />
                </svg>
            );
        })}
        <svg className="cursor-3d-face" viewBox="0 0 180 244" fill="none">
            <defs>
                <linearGradient id="cg-body" x1="14%" y1="4%" x2="84%" y2="96%">
                    <stop className="cg-s0" offset="0%" />
                    <stop className="cg-s1" offset="52%" />
                    <stop className="cg-s2" offset="100%" />
                </linearGradient>
                <linearGradient id="cg-shine" x1="0%" y1="0%" x2="58%" y2="72%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
                    <stop offset="46%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path className="cursor-3d-body" d={CURSOR_PATH} fill="url(#cg-body)" />
            <path d={CURSOR_PATH} fill="url(#cg-shine)" />
        </svg>
    </div>
);

/* ── Cursor → galaxy scroll sequence ──────────────────────────────
   A long pinned 3D section. As it scrolls the camera flies straight
   INTO the cursor (real CSS perspective — translateZ toward the
   viewer), passes through it into a warp-speed starfield where the
   content-creation lines rush toward you out of the depth, then the
   camera pulls back out and the cursor reassembles flat as "JUST
   START" lands. One rAF writes every style — no per-frame render. */
const MOTIVATION = [
    "INNOVATE WITH PURPOSE",
    "POST BEFORE YOU'RE READY",
    "DONE BEATS PERFECT",
    "MAKE MORE THAN YOU CONSUME",
    "SHOW YOUR WORK",
];
const RING_COUNT = 4;

const CursorGalaxyRaw = () => {
    const sectionRef = useRef(null);
    const warpRef = useRef(null);
    const cursorRef = useRef(null);
    const ringRefs = useRef([]);
    const lineRefs = useRef([]);
    const textEndRef = useRef(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
        const smooth = (t) => t * t * (3 - 2 * t);
        const band = (p, a, b) => smooth(clamp01((p - a) / (b - a)));
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const N = MOTIVATION.length;
        const seg = 0.56 / (N - 1);

        let raf = 0;
        let ticking = false;

        const apply = () => {
            ticking = false;
            const rect = section.getBoundingClientRect();
            const scrollable = rect.height - window.innerHeight;
            const p = scrollable > 0 ? clamp01(-rect.top / scrollable) : 0;

            // Overall warp envelope: 0 → 1 → 0 across the whole section.
            const env = Math.sin(clamp01((p - 0.05) / 0.9) * Math.PI);

            // Camera flight: 0 at the ends, deep INTO the scene in the middle.
            // Holds flat a beat first so the opening line reads before the dive.
            const flyIn = band(p, 0.16, 0.46);
            const flyOut = band(p, 0.8, 0.99);
            const cam = reduced ? 0 : flyIn - flyOut; // 0 → 1 → 0

            // Warp-speed rays — the streaks fly straight out from the
            // centre continuously (CSS keyframe loop). Scroll only sets
            // the loop SPEED and the master opacity: a steady cruise
            // through the dive, then at the very end the loop blasts to
            // hyperspeed and the whole field fades out.
            if (warpRef.current) {
                const warpIn = band(p, 0.08, 0.22);
                const warpRush = band(p, 0.80, 0.93);   // 0 → 1 : loop accelerates
                const warpOut = band(p, 0.88, 1.0);     // 0 → 1 : final fade-out
                const vis = warpIn * (1 - warpOut);
                warpRef.current.style.opacity = vis.toFixed(3);
                warpRef.current.style.setProperty("--warp-speed", (2.4 - warpRush * 2.08).toFixed(2) + "s");
                warpRef.current.style.setProperty("--warp-play", vis < 0.01 ? "paused" : "running");
                warpRef.current.style.transform =
                    `translate(-50%, -50%) translateZ(${(-520 + env * 300).toFixed(0)}px) rotate(${(p * 90).toFixed(1)}deg)`;
            }

            // Shockwave rings — a staggered train of ripples flying past the camera.
            for (let i = 0; i < RING_COUNT; i++) {
                const el = ringRefs.current[i];
                if (!el) continue;
                const phase = ((p * 4) + i / RING_COUNT) % 1;
                el.style.transform =
                    `translate(-50%, -50%) translateZ(${(-950 + phase * 1520).toFixed(0)}px) scale(${(0.5 + phase * 1.4).toFixed(3)})`;
                el.style.opacity = (Math.sin(phase * Math.PI) * env * 0.72).toFixed(3);
            }

            // Cursor is the portal: the camera drives straight into it
            // (translateZ toward the viewer) while it tumbles. The turn is
            // deliberately slow — a long ease-out to near-profile (so the
            // thick side wall is clearly on show), a generous HOLD at that
            // angle, then a long ease back to dead flat for the finish.
            // Well under a full turn so it reads as a slow, legible
            // rotation rather than a spin.
            const rollIn = band(p, 0.06, 0.44);       // slow turn out (38% of scroll)
            const rollOut = band(p, 0.60, 0.93);      // slow turn back (33% of scroll)
            const roll = reduced ? 0 : rollIn * (1 - rollOut); // 0 → 1 (held) → 0
            const spinY = roll * 265;
            const spinX = roll * 120;
            const spinZ = roll * 58;
            // Solid + tumbling while you approach and while it reforms (so the
            // thickness reads); dissolves only in the deep middle.
            const through = band(p, 0.24, 0.4) * (1 - band(p, 0.66, 0.82));
            if (cursorRef.current) {
                cursorRef.current.style.transform =
                    `translate(-50%, -50%) translateZ(${(cam * 380).toFixed(1)}px) rotateX(${spinX.toFixed(1)}deg) rotateY(${spinY.toFixed(1)}deg) rotateZ(${spinZ.toFixed(1)}deg)`;
                cursorRef.current.style.opacity = reduced ? "1" : (1 - through * 0.88).toFixed(3);
            }

            // Lines. #0 opens flat and near the camera before the dive; the
            // rest rush toward you out of the deep Z and fly past overhead.
            for (let i = 0; i < N; i++) {
                const el = lineRefs.current[i];
                if (!el) continue;

                if (i === 0) {
                    const inR = band(p, 0.05, 0.11);
                    const outR = band(p, 0.16, 0.24);
                    el.style.opacity = (inR * (1 - outR)).toFixed(3);
                    el.style.transform =
                        `translate(-50%, -50%) translateZ(${(inR * 20 - outR * 320).toFixed(0)}px) scale(${(0.84 + inR * 0.16).toFixed(3)})`;
                    continue;
                }

                const k = i - 1;
                const s = 0.24 + k * seg;
                const inR = band(p, s, s + seg * 0.22);
                const outR = band(p, s + seg * 0.82, s + seg * 1.06);
                const local = clamp01((p - s) / (seg * 1.06));
                const z = reduced ? 0 : -620 + local * 980; // far → near → past
                el.style.opacity = (inR * (1 - outR)).toFixed(3);
                el.style.transform =
                    `translate(-50%, -50%) translateZ(${z.toFixed(0)}px) rotateX(${((0.5 - local) * 10).toFixed(2)}deg) scale(${(0.96 + env * 0.08).toFixed(3)})`;
                el.style.letterSpacing = `${(-0.02 + env * 0.18).toFixed(3)}em`;
            }

            // "JUST START" — settles flat as the camera comes to rest, and
            // holds through the end so it hands straight off to the CTA.
            const endIn = band(p, 0.8, 0.95);

            // Settle the stage to the flat CTA background over the last
            // stretch — the centre glow is gone before the seam so the
            // galaxy hands straight off to the "LET'S BUILD SOMETHING"
            // panel with no visible break.
            section.style.setProperty("--glow-o", (1 - band(p, 0.86, 1)).toFixed(3));

            if (textEndRef.current) {
                textEndRef.current.style.opacity = endIn.toFixed(3);
                textEndRef.current.style.transform =
                    `translate(-50%, -50%) translateZ(${((1 - endIn) * -420).toFixed(0)}px) scale(${(0.92 + endIn * 0.08).toFixed(3)})`;
            }
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            raf = requestAnimationFrame(apply);
        };

        apply();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    return (
        <section ref={sectionRef} className="cursor-galaxy">
            <div className="cursor-galaxy-stage">
                <div className="cursor-galaxy-3d">
                    <div ref={warpRef} className="cursor-galaxy-warp" aria-hidden="true">
                        <BurstLines />
                        {!LOW_END && <BurstLines className="warp-b" />}
                    </div>
                    <div className="cursor-galaxy-rings" aria-hidden="true">
                        {Array.from({ length: RING_COUNT }, (_, i) => (
                            <span
                                key={i}
                                ref={(el) => { ringRefs.current[i] = el; }}
                                className="cursor-galaxy-ring"
                            />
                        ))}
                    </div>
                    <div ref={cursorRef} className="cursor-galaxy-cursor">
                        <CursorArrow />
                    </div>
                    <div className="cursor-galaxy-copy">
                        {MOTIVATION.map((line, i) => (
                            <p
                                key={line}
                                ref={(el) => { lineRefs.current[i] = el; }}
                                className="cursor-galaxy-line"
                            >
                                {line}
                            </p>
                        ))}
                        <p ref={textEndRef} className="cursor-galaxy-line cursor-galaxy-line-end">JUST START</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
const CursorGalaxy = memo(CursorGalaxyRaw);

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
function FallingIconsRaw({ scrollProgressRef, wordmarkRectRef, onFreeze }) {
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
                color: icon.badge.color,
                ink: icon.badge.ink,
                // gentle horizontal sway while falling
                swayAmp: 6 + ((i * 37 + 5) % 22),
                swayFreq: 0.4 + ((i * 23 + 7) % 90) / 100,
                swayPhase: ((i * 17 + 3) % 63) / 10,
                sway: 0,
            };
        });

        let last = performance.now();
        // Every time the hero starts leaving, commit a fresh snapshot of where
        // the badges currently are — the fall keeps running, so it's a different
        // arrangement each trip. Re-arms whenever you scroll back to the top.
        let armed = true;
        let buffer = null; // freshest pre-transition arrangement
        const FREEZE_AT = 0.13;
        const REARM_BELOW = 0.04;

        const buildSnap = () => {
            const layer = layerRef.current;
            const lr = layer
                ? layer.getBoundingClientRect()
                : { left: 0, top: 0, width: window.innerWidth };
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            let dots = [];
            for (const it of items) {
                const x = (it.x / 100) * lr.width + it.sway + lr.left;
                const y = it.y + lr.top;
                if (y < -120 || y > vh + 120 || x < -120 || x > vw + 120) continue;
                dots.push({
                    x, y,
                    size: it.size * it.scale,
                    color: it.color,
                    ink: it.ink,
                    depth: it.depth,
                });
            }
            // Thin a dense arrangement so the mosaic reads as texture, not clutter.
            const MAX = 15;
            if (dots.length > MAX) {
                const step = dots.length / MAX;
                dots = Array.from({ length: MAX }, (_, i) => dots[Math.floor(i * step)]);
            }
            return { vw, vh, dots };
        };

        const tick = () => {
            const now = performance.now();
            const dt = Math.min((now - last) / 1000, 2);
            last = now;
            if (document.hidden) return;

            const sp = scrollProgressRef.current;
            const layer = layerRef.current;

            if (armed) {
                if (sp >= FREEZE_AT) {
                    armed = false;
                    if (onFreeze) onFreeze(buffer || buildSnap());
                } else if (sp > 0.01) {
                    // keep a live copy of the current (natural, pre-vacuum) layout
                    buffer = buildSnap();
                }
            } else if (sp < REARM_BELOW) {
                armed = true;
                buffer = null;
            }

            // Drive the layer's scroll fade here rather than through React so a
            // scroll never re-renders this 34-node subtree.
            if (layer) {
                const layerOpacity = Math.max(0, 1 - sp * 2);
                layer.style.opacity = layerOpacity.toFixed(3);
                layer.style.transform = `translateY(${(-sp * 100).toFixed(2)}%)`;
            }

            // The layer is fully faded by sp ≈ 0.5 — stop per-icon work past that.
            if (sp > 0.55) return;

            const H = window.innerHeight;
            const lr = layer ? layer.getBoundingClientRect() : { left: 0, top: 0, width: H };

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

                it.el.style.transform =
                    `translate3d(${(rx - half).toFixed(1)}px, ${(ry - half).toFixed(1)}px, ${z.toFixed(1)}px) ` +
                    `rotateX(${(it.rot * it.tumble).toFixed(2)}deg) ` +
                    `rotateY(${(it.rot * it.tumble * 0.7).toFixed(2)}deg) ` +
                    `rotateZ(${it.rot.toFixed(2)}deg) scale(${it.scale.toFixed(3)})`;
                it.el.style.opacity = opacity.toFixed(3);
                it.el.style.filter = it.blur > 0.02 ? `blur(${it.blur.toFixed(2)}px)` : "none";
            }
        };

        let raf = requestAnimationFrame(function loop() {
            raf = requestAnimationFrame(loop);
            tick();
        });
        return () => cancelAnimationFrame(raf);
    }, [scrollProgressRef, wordmarkRectRef, onFreeze]);

    return (
        <div ref={layerRef} className="falling-icons-layer" aria-hidden="true">
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
const FallingIcons = memo(FallingIconsRaw);

/* ── Pixelised snapshot of the fallen icons ───────────────────────
   Draws the frozen badge arrangement as a chunky low-res pixel mosaic
   on a fixed full-viewport canvas, so it sits in the background of
   every section below the hero exactly where the icons landed. */
const PIX_CELL = 6;

function hexToRgba(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
function pixNoise(x, y) {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
}

const PixelSnapshot = memo(function PixelSnapshot({ snapshot }) {
    const canvasRef = useRef(null);

    // Self-determined visibility: show whenever the hero is out of view.
    useEffect(() => {
        const canvas = canvasRef.current;
        const hero = document.querySelector(".panel-hero");
        if (!canvas || !hero) {
            if (canvas) canvas.classList.add("pixel-snapshot-on");
            return;
        }
        const io = new IntersectionObserver(
            ([e]) => canvas.classList.toggle("pixel-snapshot-on", !e.isIntersecting),
            { threshold: 0 },
        );
        io.observe(hero);
        return () => io.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !snapshot) return;
        const ctx = canvas.getContext("2d");

        const draw = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            const sx = snapshot.vw ? w / snapshot.vw : 1;
            const sy = snapshot.vh ? h / snapshot.vh : 1;

            // Silhouettes only — a faint dot-matrix halftone of each badge,
            // dim and transparent so it reads as a ghost, not a graphic.
            const DOT = 2; // tiny dot inside each grid cell
            for (const d of snapshot.dots) {
                const cx = Math.round((d.x * sx) / PIX_CELL) * PIX_CELL;
                const cy = Math.round((d.y * sy) / PIX_CELL) * PIX_CELL;
                const rad = Math.max(2, Math.round((d.size * 0.36) / PIX_CELL));
                const baseA = 0.2 + d.depth * 0.18;

                for (let gy = -rad; gy <= rad; gy++) {
                    for (let gx = -rad; gx <= rad; gx++) {
                        const dist = Math.sqrt(gx * gx + gy * gy);
                        if (dist > rad + 0.15) continue;
                        // drop a few dots for a lighter halftone
                        if (pixNoise(gx * 7 + d.x, gy * 7 + d.y) < 0.16) continue;
                        const px = cx + gx * PIX_CELL;
                        const py = cy + gy * PIX_CELL;
                        const fall = 0.55 + 0.45 * (1 - dist / (rad + 0.5));
                        const a = baseA * fall * (0.72 + 0.28 * pixNoise(px, py));
                        ctx.fillStyle = hexToRgba(d.color, Math.min(0.55, a));
                        ctx.fillRect(px, py, DOT, DOT);
                    }
                }
            }
        };

        draw();
        window.addEventListener("resize", draw);
        return () => window.removeEventListener("resize", draw);
    }, [snapshot]);

    return <canvas ref={canvasRef} className="pixel-snapshot" aria-hidden="true" />;
});

/* ── Cursor-following green snake — rides along on every section
   below the hero (lifted out of the profile panel). ─────────────── */
const SNAKE_BLOCKS = Array.from({ length: 15 }, (_, i) => ({
    size: 11 + ((i * 7) % 14),
    opacity: 0.5 + ((i % 4) * 0.12),
}));

const CursorSnakeRaw = () => {
    const wrapRef = useRef(null);
    const blockRefs = useRef([]);

    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let active = false;
        const hero = document.querySelector(".panel-hero");
        const io = hero
            ? new IntersectionObserver(
                ([e]) => {
                    active = !e.isIntersecting;
                    wrap.classList.toggle("cursor-snake-on", active);
                },
                { threshold: 0 },
            )
            : null;
        if (io) io.observe(hero);
        else { active = true; wrap.classList.add("cursor-snake-on"); }

        const cx0 = window.innerWidth / 2;
        const cy0 = window.innerHeight / 2;
        const points = SNAKE_BLOCKS.map(() => ({ x: cx0, y: cy0 }));
        const target = { x: cx0, y: cy0 };
        const onMove = (e) => { target.x = e.clientX; target.y = e.clientY; };
        window.addEventListener("pointermove", onMove, { passive: true });

        let last = performance.now();
        const tick = () => {
            const now = performance.now();
            const dt = Math.min((now - last) / 1000, 0.08);
            last = now;
            if (!active || document.hidden || reduced) return;

            const headEase = 1 - Math.pow(0.0009, dt);
            points[0].x += (target.x - points[0].x) * headEase;
            points[0].y += (target.y - points[0].y) * headEase;

            for (let i = 1; i < points.length; i++) {
                const prev = points[i - 1];
                const pt = points[i];
                const dx = prev.x - pt.x;
                const dy = prev.y - pt.y;
                const dist = Math.hypot(dx, dy) || 1;
                const gap = 17 + i * 1.4;
                if (dist > gap) {
                    const ease = 1 - Math.pow(0.0001, dt);
                    pt.x += (prev.x - (dx / dist) * gap - pt.x) * ease;
                    pt.y += (prev.y - (dy / dist) * gap - pt.y) * ease;
                }
            }

            for (let i = 0; i < points.length; i++) {
                const el = blockRefs.current[i];
                if (!el) continue;
                const s = SNAKE_BLOCKS[i].size;
                const pulse = 1 + Math.sin(now / 260 + i * 0.7) * 0.09;
                el.style.transform =
                    `translate3d(${(points[i].x - s / 2).toFixed(1)}px, ${(points[i].y - s / 2).toFixed(1)}px, 0) scale(${pulse.toFixed(3)})`;
            }
        };

        let raf = requestAnimationFrame(function loop() {
            raf = requestAnimationFrame(loop);
            tick();
        });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onMove);
            if (io) io.disconnect();
        };
    }, []);

    return (
        <div ref={wrapRef} className="cursor-snake" aria-hidden="true">
            {SNAKE_BLOCKS.map((b, i) => (
                <span
                    key={i}
                    ref={(el) => { blockRefs.current[i] = el; }}
                    className="cursor-snake-block"
                    style={{ width: b.size, height: b.size, opacity: b.opacity }}
                />
            ))}
        </div>
    );
};
const CursorSnake = memo(CursorSnakeRaw);

/* ── Falling badges — the hero's icons rain down the CTA once the
   galaxy sequence ends ("LET'S BUILD SOMETHING"). ─────────────────── */
// Same per-icon model as the hero's FALLING_ICONS — depth drives the
// parallax (near = big/sharp/fast, far = small/blurry/slow), plus drift,
// spin, tumble and a gentle sway. The only difference from the hero is
// the spawn line: here the rain starts at the cursor tip's height row
// instead of the top of the screen.
const CTA_BADGE_COUNT = LOW_END ? 20 : 38;
const CTA_BADGES = Array.from({ length: CTA_BADGE_COUNT }, (_, i) => ({
    badge: BADGE_ICONS[i % BADGE_ICONS.length],
    size: 30 + ((i * 7 + 3) % 38),
    x: ((i * 137 + 42) % 96),
    delay: ((i * 1.1 + 0.3) % 7),
    drift: (((i * 29 + 11) % 26) - 13),
    startAngle: ((i * 61 + 17) % 360),
    spin: (((i * 53 + 7) % 220) - 110),
    tumble: 0.6 + (((i * 41 + 3) % 100) / 100),
    depth: 0.05 + (((i * 37 + 11) % 105) / 100),
}));

const FallingBadgesRaw = () => {
    const rootRef = useRef(null);
    const elsRef = useRef([]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const els = elsRef.current;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        // This layer is `position: fixed` over the whole viewport (see
        // `.cta-badge-rain` in the CSS) so the icons can rain from the
        // very top of the SCREEN — above the big blue galaxy cursor /
        // "JUST START" — and keep falling straight through into the CTA
        // panel. Nothing in the CTA panel can clip it because it is not
        // inside the panel's `overflow` box.
        const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
        const galaxyEl = document.querySelector(".cursor-galaxy");
        const ctaEl = root.closest(".panel-cta") || document.querySelector(".panel-cta");
        const N = CTA_BADGES.length;
        const STACK = 1500;   // column height reaching up off the top of the screen

        // Per-icon runtime state — identical parallax model to the hero:
        // near icons (high depth) fall faster, bigger and sharper; far
        // icons drift down slow, small and blurred. Pre-spread from well
        // above the screen down through it so the stream is already full.
        const spread = STACK + window.innerHeight + 140;
        const items = CTA_BADGES.map((c, i) => {
            const speed = 20 + c.depth * 60;
            const scale = 0.55 + c.depth * 0.75;
            const blur = Math.max(0, 1 - c.depth) * 3;
            return {
                el: els[i],
                x: c.x,                                  // percent of viewport width
                y: -STACK + ((i + 0.5) / N) * spread,    // 0 = top of the screen
                vx: c.drift,
                vy: speed,
                rot: c.startAngle,
                rotV: c.spin,
                tumble: c.tumble,
                scale,
                blur,
                size: c.size,
                swayAmp: 6 + ((i * 37 + 5) % 22),
                swayFreq: 0.4 + ((i * 23 + 7) % 90) / 100,
                swayPhase: ((i * 17 + 3) % 63) / 10,
                sway: 0,
            };
        });

        let last = performance.now();
        let layerOpacity = 0;

        const frame = () => {
            raf = requestAnimationFrame(frame);
            const now = performance.now();
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            if (document.hidden) return;

            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Fade the whole layer in the moment the cursor animation is
            // finishing — while "JUST START" is still centred, before the
            // CTA panel is reached — and back out once the CTA has
            // scrolled off the top. Keyed to the galaxy section's own
            // scroll progress, not the CTA's position.
            let target = 0;
            if (galaxyEl && ctaEl) {
                const g = galaxyEl.getBoundingClientRect();
                const c = ctaEl.getBoundingClientRect();
                const gp = clamp01(-g.top / Math.max(1, g.height - vh)); // 0..1 through the galaxy
                const enter = clamp01((gp - 0.66) / 0.16);              // fully in by ~82% (JUST START)
                const leave = clamp01(c.bottom / (vh * 0.7));
                target = Math.min(enter, leave);
            }
            layerOpacity += (target - layerOpacity) * Math.min(1, dt * 6);
            root.style.opacity = layerOpacity.toFixed(3);
            if (layerOpacity < 0.004) return;

            for (const it of items) {
                if (!it.el) continue;

                it.swayPhase += it.swayFreq * dt;
                it.sway = Math.sin(it.swayPhase) * it.swayAmp;
                it.rot += it.rotV * dt;
                it.y += it.vy * dt;
                it.x += it.vx * dt;

                // Recycle straight back above the top of the screen.
                if (it.y > vh + 90) {
                    it.y = -60 - Math.random() * 240;
                    it.x = 4 + Math.random() * 92;
                }
                if (it.x < 2) { it.x = 2; it.vx = Math.abs(it.vx); }
                else if (it.x > 98) { it.x = 98; it.vx = -Math.abs(it.vx); }

                const half = (it.size * it.scale) / 2;
                const rx = (it.x / 100) * vw + it.sway;
                const z = it.scale * 90;

                // Soft fade in above the screen top, fade out at the foot.
                let op = 0.5;
                if (it.y < 0) op = Math.max(0, 0.5 * (1 + it.y / 200));
                else if (it.y > vh - 90) op = Math.max(0, 0.5 * ((vh - it.y) / 90));

                it.el.style.transform =
                    `translate3d(${(rx - half).toFixed(1)}px, ${(it.y - half).toFixed(1)}px, ${z.toFixed(1)}px) ` +
                    `rotateX(${(it.rot * it.tumble).toFixed(2)}deg) ` +
                    `rotateY(${(it.rot * it.tumble * 0.7).toFixed(2)}deg) ` +
                    `rotateZ(${it.rot.toFixed(2)}deg) scale(${it.scale.toFixed(3)})`;
                it.el.style.opacity = op.toFixed(3);
                it.el.style.filter = it.blur > 0.02 ? `blur(${it.blur.toFixed(2)}px)` : "none";
            }
        };

        let raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div ref={rootRef} className="falling-icons-layer cta-badge-rain" aria-hidden="true">
            {CTA_BADGES.map((c, i) => (
                <div
                    key={i}
                    ref={(el) => { elsRef.current[i] = el; }}
                    className={`falling-icon falling-badge falling-badge-${c.badge.kind}`}
                    style={{
                        width: c.size,
                        height: c.size,
                        "--badge-color": c.badge.color,
                        "--badge-ink": c.badge.ink,
                    }}
                >
                    <span className="falling-badge-symbol" />
                </div>
            ))}
        </div>
    );
};
const FallingBadges = memo(FallingBadgesRaw);

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

/* ── Title-on-cloud bounce (shared by both cloud platforms) ──────────
   Pointer pressure dents the nearest puff; a click launches the title
   into a taller jelly bounce. Returns a cleanup function. */
function setupCloudBounce({ title, cloud, wrapper, puffs, PUFFS }) {
    if (!title || !cloud || !wrapper || puffs.length !== PUFFS.length) return () => {};

    gsap.set(title, { transformOrigin: "50% 100%" });
    gsap.set(cloud, { transformOrigin: "50% 100%" });

    let settled = false;
    let bouncing = false;
    let idle = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resetPuffs = (duration = 0.3) => {
        PUFFS.forEach((p, i) => {
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
        const pointerX = Math.max(0, Math.min(200, ((clientX - rect.left) / rect.width) * 200));
        PUFFS.forEach((p, i) => {
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
        idle = gsap.timeline({ repeat: -1, yoyo: true })
            .to(cloud, { scaleY: 1.06, scaleX: 0.94, rotation: -1.5, duration: 2.2, ease: "sine.inOut" })
            .to(cloud, { scaleY: 0.97, scaleX: 1.03, rotation: 1.5, duration: 2.0, ease: "sine.inOut" })
            .to(cloud, { scaleY: 1, scaleX: 1, rotation: 0, duration: 1.8, ease: "sine.inOut" });
    };

    const settleAfterBounce = () => {
        bouncing = false;
        resetPuffs(0.35);
        startIdle();
    };

    if (reducedMotion) {
        gsap.set(title, { y: 0, autoAlpha: 1 });
        gsap.set(cloud, { scaleX: 1, scaleY: 1 });
        settled = true;
    } else {
        gsap
            .timeline()
            .fromTo(
                title,
                { y: -65, autoAlpha: 0, rotation: -3 },
                { y: 0, autoAlpha: 1, rotation: 0, duration: 0.5, ease: "power3.in" }
            )
            .to(cloud, { scaleY: 0.55, scaleX: 1.45, duration: 0.08, ease: "power4.in" }, ">")
            .to(title, { y: 8, duration: 0.08, ease: "power4.in" }, "<")
            .to(cloud, { scaleY: 1.15, scaleX: 0.85, duration: 0.25, ease: "power2.out" }, ">")
            .to(title, { y: -18, duration: 0.25, ease: "power2.out" }, "<")
            .to(cloud, { scaleY: 0.92, scaleX: 1.08, duration: 0.2, ease: "power2.out" }, ">")
            .to(title, { y: 4, duration: 0.2, ease: "power2.out" }, "<")
            .to(cloud, { scaleY: 1.04, scaleX: 0.97, duration: 0.15, ease: "power2.out" }, ">")
            .to(title, { y: -5, duration: 0.15, ease: "power2.out" }, "<")
            .to(cloud, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1.2, 0.3)" }, ">")
            .to(title, { y: 0, duration: 0.6, ease: "elastic.out(1.2, 0.3)" }, "<")
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
            .to(cloud, { scaleY: 0.45, scaleX: 1.5, rotation: -2, duration: 0.1, ease: "power4.in" })
            .to(title, { y: 10, rotation: 2, duration: 0.1, ease: "power4.in" }, "<")
            .to(title, { y: -140, rotation: -4, duration: 0.35, ease: "power3.out" }, "<")
            .to(cloud, { scaleY: 1.18, scaleX: 0.82, rotation: 1, duration: 0.22, ease: "power2.out" }, "<-0.05")
            .to(title, { y: 12, rotation: 1, duration: 0.3, ease: "bounce.out" }, ">")
            .to(cloud, { scaleY: 0.88, scaleX: 1.12, duration: 0.12, ease: "power2.in" }, "<")
            .to(title, { y: -45, rotation: -1, duration: 0.2, ease: "power2.out" }, ">")
            .to(cloud, { scaleY: 1.08, scaleX: 0.93, duration: 0.2, ease: "power2.out" }, "<")
            .to(title, { y: 5, rotation: 0.5, duration: 0.15, ease: "power2.out" }, ">")
            .to(cloud, { scaleY: 0.96, scaleX: 1.04, duration: 0.15, ease: "power2.out" }, "<")
            .to(title, { y: 0, rotation: 0, duration: 0.5, ease: "elastic.out(1.2, 0.25)" }, ">")
            .to(cloud, { scaleY: 1, scaleX: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1.2, 0.25)" }, "<");
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
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════ */
const MadajBuilds = () => {
    const heroRef = useRef(null);
    const wordmarkRectRef = useRef(null);
    const profileCurveRef = useRef(null);
    const titleCloudRef = useRef(null);
    const titleRef = useRef(null);
    const cloudRef = useRef(null);
    const puffRefs = useRef([]);
    // Cloud 2 refs
    const titleCloudRef2 = useRef(null);
    const titleRef2 = useRef(null);
    const cloudRef2 = useRef(null);
    const puffRefs2 = useRef([]);

    const { scrollProgress, heroInView } = useScrollProgress(heroRef);

    // A live ref of scroll progress for rAF loops that must not trigger renders.
    const scrollProgressRef = useRef(scrollProgress);
    useEffect(() => {
        scrollProgressRef.current = scrollProgress;
    }, [scrollProgress]);

    // Curved-poster: the profile panel bends/reclines as it scrolls up into
    // view out of the hero, then eases dead flat. Driven straight to CSS
    // custom props on the (untransformed) section — no React re-render.
    useEffect(() => {
        const section = profileCurveRef.current;
        if (!section) return;
        const smooth = (t) => t * t * (3 - 2 * t);
        let raf = 0;
        let ticking = false;
        const measure = () => {
            ticking = false;
            const r = section.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            // 0 when the section first pokes above the fold, 1 once it has
            // risen ~1.6 viewports — a long window so the poster is still
            // visibly curling while its content is on screen.
            const enter = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.85)));
            const curl = 1 - smooth(enter);
            section.style.setProperty("--curl", curl.toFixed(4));
            // Fade in as soon as the panel starts entering from the bottom
            // so there's no empty run between it and the hero.
            const appear = Math.max(0, Math.min(1, (vh * 1.05 - r.top) / (vh * 0.42)));
            section.style.setProperty("--curl-opacity", appear.toFixed(3));
        };
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            raf = requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    // Eased scroll progress for smoother premium animations
    const sp = scrollProgress;
    const sp2 = sp * sp; // ease-in
    const spReverse = 1 - sp; // reverse for fade-out calculations


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
    const pillPath = PILL_PATH;
    const [clock, setClock] = useState("--:--:--");
    const [coords, setCoords] = useState("0000 X 0000 Y");
    const beep = useBeep(soundOn);
    const theme = THEMES[themeIndex];

    // Pixel-mosaic of the falling icons — re-captured fresh each time the hero
    // leaves, so it reflects the icons' latest positions rather than a fixed one.
    const [pixelSnapshot, setPixelSnapshot] = useState(null);
    const handleIconFreeze = useCallback((snap) => {
        setPixelSnapshot(snap);
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

    // Coords — throttled to ~10 Hz. Updating this on every mousemove would
    // re-render the whole page (and thrash the rolling-digit spans) constantly.
    useEffect(() => {
        let nextX = 0;
        let nextY = 0;
        let queued = false;
        let lastPush = 0;
        const pad = (n) => String(n).padStart(4, "0");

        const flush = () => {
            queued = false;
            lastPush = performance.now();
            setCoords(`${pad(nextX)} X ${pad(nextY)} Y`);
        };
        const onMove = (e) => {
            nextX = Math.round(e.clientX);
            nextY = Math.round(e.clientY);
            if (queued) return;
            queued = true;
            const wait = Math.max(0, 100 - (performance.now() - lastPush));
            setTimeout(flush, wait);
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    // Year
    useEffect(() => {
        const el = document.getElementById("mb-year");
        if (el) el.textContent = new Date().getFullYear();
    }, []);

    // Title-on-cloud bounce — both platforms share one implementation.
    useGSAP(() => setupCloudBounce({
        title: titleRef.current,
        cloud: cloudRef.current,
        wrapper: titleCloudRef.current,
        puffs: puffRefs.current,
        PUFFS: CLOUD_PUFFS,
    }), []);

    useGSAP(() => setupCloudBounce({
        title: titleRef2.current,
        cloud: cloudRef2.current,
        wrapper: titleCloudRef2.current,
        puffs: puffRefs2.current,
        PUFFS: CLOUD2_PUFFS,
    }), []);


    /* ── Dynamically position ladder-1 to connect cloud 1 → "m" ── */
    useGSAP(() => {
        const ladderEl = document.querySelector(".ladder-1");
        const cloud1El = document.querySelector(".cloud-1");
        if (!ladderEl || !cloud1El) return;

        function positionLadder() {
            const canvas = document.querySelector(".hero-canvas-wrap canvas");
            if (!canvas) return;
            const canvasRect = canvas.getBoundingClientRect();
            const hd = document.querySelector(".hero-diagonal").getBoundingClientRect();
            const c1 = cloud1El.getBoundingClientRect();

            // Cloud bottom-right (the "end" of the cloud)
            const cx = c1.right - hd.left;
            const cy = c1.bottom - hd.top;

            // "m" letter — first letter, roughly 20% from canvas left
            const mx = canvasRect.left - hd.left + canvasRect.width * 0.20;
            const my = canvasRect.top - hd.top + canvasRect.height * 0.45;

            // Vector from cloud BR to "m" top-left
            // Vector from "m" (pivot) to cloud BR (target)
            const toTargetX = cx - mx;
            const toTargetY = cy - my; // negative = up
            const length = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
            // Angle from vertical (straight up = -Y). Positive = top leans right.
            const angle = Math.atan2(toTargetX, -toTargetY) * (180 / Math.PI);

            // Ladder element is22px wide, transform-origin: bottom center.
            // Pivot is at the horizontal center of the element, bottom edge.
            // Use clientWidth/clientHeight to exclude padding
            const hdW = hd.clientWidth || hd.width;
            const hdH = hd.clientHeight || hd.height;
            // Account for left padding so CSS percentage lands correctly
            const hdPadL = hd.left - (hd.parentElement ? hd.parentElement.getBoundingClientRect().left : 0);
            const mxAdj = mx - hdPadL;

            const pctLength = (length / hdH) * 100;
            const elemW = 22;
            const halfW = elemW / 2;

            const leftPct = ((mxAdj - halfW) / hdW) * 100;
            const topPct = ((my / hdH) * 100) - pctLength;

            ladderEl.style.top = topPct + "%";
            ladderEl.style.left = leftPct + "%";
            ladderEl.style.height = pctLength + "%";
            ladderEl.style.setProperty("--ladder-angle", angle + "deg");
        }

        // The ladder only moves on resize or as the hero scrolls (the
        // hero-diagonal carries a scroll transform) — no forever-interval.
        const hero = document.querySelector(".hero-diagonal");
        positionLadder();
        const t1 = setTimeout(positionLadder, 150);
        const t2 = setTimeout(positionLadder, 600);
        const obs = new ResizeObserver(positionLadder);
        if (hero) obs.observe(hero);

        let queued = false;
        const onScroll = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => { queued = false; positionLadder(); });
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            obs.disconnect();
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    /* ── Dynamically position ladder-2: "s" → cloud 2 ── */
    useGSAP(() => {
        const ladderEl = document.querySelector(".ladder-2");
        const cloud2El = document.querySelector(".cloud-2");
        if (!ladderEl || !cloud2El) return;

        function positionLadder2() {
            const canvas = document.querySelector(".hero-canvas-wrap canvas");
            if (!canvas) return;
            const canvasRect = canvas.getBoundingClientRect();
            const hd = document.querySelector(".hero-diagonal").getBoundingClientRect();
            const c2 = cloud2El.getBoundingClientRect();

            // "s" letter — use as the ladder TOP (anchor with transform-origin: top center)
            const sx = canvasRect.left - hd.left + canvasRect.width * 0.78;
            const sy = canvasRect.top - hd.top + canvasRect.height * 0.45;

            // Cloud 2 — use its top-center as the ladder BOTTOM target
            const cx = (c2.left + c2.right) / 2 - hd.left;
            const cy = c2.top - hd.top;

            // Vector from "s" (top/anchor) to cloud 2 (bottom/target)
            const toTargetX = cx - sx;
            const toTargetY = cy - sy; // positive = down (cloud-2 is below "s")
            const length = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
            // Angle from vertical-down (+Y). Positive = bottom leans right.
            const angle = Math.atan2(toTargetX, toTargetY) * (180 / Math.PI);

            const hdW = hd.width;
            const hdH = hd.height;
            const pctLength = (length / hdH) * 100;
            const elemW = 22;
            const halfW = elemW / 2;

            // Place anchor (top-center) at "s" position
            const leftPct = ((sx - halfW) / hdW) * 100;
            const topPct = (sy / hdH) * 100;

            ladderEl.style.top = topPct + "%";
            ladderEl.style.left = leftPct + "%";
            ladderEl.style.height = pctLength + "%";
            ladderEl.style.setProperty("--ladder-angle", angle + "deg");
        }

        const hero = document.querySelector(".hero-diagonal");
        positionLadder2();
        const t1 = setTimeout(positionLadder2, 150);
        const t2 = setTimeout(positionLadder2, 600);
        const obs = new ResizeObserver(positionLadder2);
        if (hero) obs.observe(hero);

        let queued = false;
        const onScroll = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => { queued = false; positionLadder2(); });
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            obs.disconnect();
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <ReactLenis root options={{ duration: 1.2, smoothWheel: true }}>
            {/* Background effects */}
            <OceanWave scrollProgressRef={scrollProgressRef} />
            <WaterDrop scrollProgressRef={scrollProgressRef} />
            <VacuumTransition scrollProgress={scrollProgress} />

            {/* Frozen pixel-mosaic of the fallen icons + cursor-snake —
                both ride the background of every section below the hero */}
            {pixelSnapshot && <PixelSnapshot snapshot={pixelSnapshot} />}
            <CursorSnake />

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
                    {/* Diagonal cloud-ladder layout */}
                    <div className="hero-diagonal" style={{
                        opacity: Math.max(0, 1 - sp * 1.2),
                        transform: `translateY(${-sp * 60}%) translateZ(${-sp * 80}px)`,
                    }}>
                        {/* Cloud 1 — top left: Title */}
                        <div className="cloud-platform cloud-1" style={{
                            opacity: Math.max(0, spReverse * spReverse),
                            transform: `translateY(${-sp2 * 180}px) translateZ(${-sp2 * 80}px) scaleX(${1 - sp2 * 0.6}) scaleY(${1 + sp * 0.2}) rotate(${-sp * 5}deg) blur(${sp * 2}px)`,
                            filter: `blur(${sp * 3}px)`,
                        }}>
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

                        {/* Ladder connecting cloud 1 → cloud 2 */}
                        <div className="diagonal-ladder ladder-1" style={{
                            opacity: Math.max(0, 0.4 * spReverse * spReverse),
                            filter: `blur(${sp * 3}px)`,
                        }}>
                            <span className="d-rail d-rail-l" />
                            <span className="d-rail d-rail-r" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                        </div>

                        {/* Cloud 2 — bottom right: Tagline */}
                        <div className="cloud-platform cloud-2" style={{
                            opacity: Math.max(0, spReverse * spReverse),
                            transform: `translateY(${-sp2 * 160}px) translateZ(${-sp2 * 70}px) scaleX(${1 - sp2 * 0.55}) scaleY(${1 + sp * 0.18}) rotate(${sp * 4}deg)`,
                            filter: `blur(${sp * 2.5}px)`,
                        }}>
                            <div className="title-on-cloud" ref={titleCloudRef2}>
                                <h1
                                    className="hero-title"
                                    ref={titleRef2}
                                    aria-label="Building AI systems and Learning in public"
                                >
                                    <BentTitleLine text="Building AI systems" curve={8} />
                                    <BentTitleLine text="Learning in public" curve={6} />
                                </h1>
                                <svg className="cloud-seat" viewBox="0 0 200 70" preserveAspectRatio="none" ref={cloudRef2} aria-hidden="true">
                                    <g fill="currentColor">
                                        {CLOUD2_PUFFS.map((puff, i) => (
                                            <ellipse
                                                key={i}
                                                cx={puff.cx}
                                                cy={puff.cy}
                                                rx={puff.rx}
                                                ry={puff.ry}
                                                ref={(element) => { puffRefs2.current[i] = element; }}
                                            />
                                        ))}
                                    </g>
                                </svg>
                            </div>
                        </div>

                        {/* Ladder connecting "s" → cloud 2 */}
                        <div className="diagonal-ladder ladder-2" style={{
                            opacity: Math.max(0, 0.4 * spReverse * spReverse),
                            filter: `blur(${sp * 2.5}px)`,
                        }}>
                            <span className="d-rail d-rail-l" />
                            <span className="d-rail d-rail-r" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                            <span className="d-rung" />
                        </div>

                    </div>

                    {/* 3D Canvas — absolutely positioned, behind headline */}
                    <div className="hero-canvas-wrap">
                        <Suspense fallback={<div className="hero-canvas" style={{ width: "100%", height: "100%" }} />}>
                            <Hero3D scrollProgress={scrollProgress} themeKey={theme.key} wordmarkRectRef={wordmarkRectRef} active={heroInView} />
                        </Suspense>
                    </div>

                    {/* Bottom-left tagline */}
                    <div className="hero-tagline" style={{
                        opacity: Math.max(0, 1 - sp * 1.5),
                        transform: `translateY(${-sp * 50}px) translateX(${-sp2 * 100}px) perspective(800px) rotateY(${sp * 15}deg)`,
                    }}>
                        <p className="hero-tagline-text">
                            I BRING<br />
                            CRAFT &amp; TASTE<br />
                            TO DIGITAL WORK
                        </p>
                    </div>

                    {/* Falling icons layer */}
                    <FallingIcons scrollProgressRef={scrollProgressRef} wordmarkRectRef={wordmarkRectRef} onFreeze={handleIconFreeze} />

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

                {/* ── PANEL TWO: PROFILE (curved poster) ────────────── */}
                <section className="panel panel-two" ref={profileCurveRef}>
                    <div className="profile-curve">
                        <ProfilePanel />
                    </div>
                </section>

                {/* ── PANEL CURSOR → GALAXY ─────────────────────── */}
                <CursorGalaxy />

                {/* ── PANEL CTA ─────────────────────────────────────── */}
                <section className="panel panel-cta" id="contact">
                    <FallingBadges />
                    <svg className="star" viewBox="0 0 40 40" style={{ color: "#fbbf24" }} aria-hidden="true">
                        <path fill="currentColor" d="M20 2 L24 15 L38 15 L27 24 L31 38 L20 29 L9 38 L13 24 L2 15 L16 15 Z" />
                    </svg>
                    <svg className="blob br" viewBox="0 0 120 90" aria-hidden="true">
                        <path fill="currentColor" d="M8 46 Q2 24 22 16 Q30 4 48 10 Q66 2 76 18 Q96 20 92 42 Q100 60 80 66 Q70 82 50 76 Q30 88 16 70 Q-2 66 8 46 Z" />
                    </svg>

                    {/* 3D chained cursive — the hero's balloon-script style,
                        floating in the space above the headline */}
                    <Suspense fallback={null}>
                        <CtaWord3D themeKey={theme.key} />
                    </Suspense>

                    <div className="cta-stage">
                        <h2 className="headline cta-headline">
                            <span className="cta-row cta-line-a">BUILD</span>
                            <span className="cta-row cta-line-b">IN PUBLIC</span>
                            <span className="cta-row cta-line-c">WITH ME</span>
                        </h2>
                    </div>

                    <div className="cta-footer">
                        <div className="cta-links mono">
                            <a href="https://www.youtube.com/@madajbuilds" target="_blank" rel="noopener noreferrer">YOUTUBE</a>
                            <a href="https://github.com/Adam-Jemmali" target="_blank" rel="noopener noreferrer">GITHUB</a>
                            <a href="https://www.instagram.com/madaj_2/" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
                            <a href="mailto:adam.official.514@gmail.com">EMAIL</a>
                        </div>
                        <p className="footer-note mono">MADAJ.BUILDS &copy; <span id="mb-year" /></p>
                    </div>
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

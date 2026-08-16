import { useEffect, useRef } from "react";
import gsap from "gsap";

// "Adam" = A monogram + "dam"; "Jemmali" = J monogram + "emmali".
const LINES = [
    { icon: "a", text: "dam" },
    { icon: "j", text: "emmali" },
];

// OS-consistent LED dot-matrix palette (matches the aurora desktop).
const DOT_BASE = "rgba(226, 239, 255, 0.92)";
const DOT_SPECKLE = "#00e5ff";

const FONT_SIZE = 120;
const LINE_GAP = 1.1; // baseline-to-baseline, as a multiple of FONT_SIZE
const GRID = 4; // sample spacing → dot density
const DOT_R = 1.8; // dot radius
const PAD_X = 14;
const ICON_SCALE = 0.92; // monogram height as a fraction of FONT_SIZE
const ICON_GAP = 0.06; // gap between monogram and text
const ICON_ASPECT = { a: 155 / 150, j: 145 / 150 };

// Cursor repulsion + swirl field tuning.
const REPEL_RADIUS = 115;
const REPEL_STRENGTH = 60;
const SWIRL = 0.75; // tangential (orbit) strength
const LERP = 0.12;

const seededRandom = (seed) => {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
};

const buildField = () => {
    const family = "Georama, -apple-system, 'Segoe UI', system-ui, sans-serif";
    const lineHeight = Math.round(FONT_SIZE * LINE_GAP);
    const H = lineHeight * LINES.length;
    const lineCy = LINES.map((_, i) => lineHeight * i + lineHeight / 2);

    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    octx.font = `800 ${FONT_SIZE}px ${family}`;

    const iconH = FONT_SIZE * ICON_SCALE;
    const iconW = LINES.map((l) => iconH * ICON_ASPECT[l.icon]);
    const textW = LINES.map((l) => octx.measureText(l.text).width);
    const gap = FONT_SIZE * ICON_GAP;
    const groupW = LINES.map((_, i) => iconW[i] + gap + textW[i]);
    const W = Math.round(Math.max(...groupW) + PAD_X * 2);

    off.width = W;
    off.height = H;
    octx.font = `800 ${FONT_SIZE}px ${family}`;
    octx.fillStyle = "#fff";
    octx.textAlign = "left";
    octx.textBaseline = "middle";

    const icons = [];
    const charRanges = [];
    LINES.forEach((l, i) => {
        const left = (W - groupW[i]) / 2;
        icons.push({ key: l.icon, x: left, y: lineCy[i] - iconH / 2, w: iconW[i], h: iconH });
        const textX = left + iconW[i] + gap;
        octx.fillText(l.text, textX, lineCy[i]);
        let cursor = textX;
        for (const ch of l.text) {
            const cw = octx.measureText(ch).width;
            charRanges.push({ ch, start: cursor, end: cursor + cw, center: cursor + cw / 2, line: i });
            cursor += cw;
        }
    });

    const img = octx.getImageData(0, 0, W, H).data;
    const dots = [];
    for (let y = 0; y < H; y += GRID) {
        for (let x = 0; x < W; x += GRID) {
            const idx = (y * W + x) * 4;
            if (img[idx + 3] > 140) {
                let li = -1;
                for (let c = 0; c < charRanges.length; c++) {
                    const r = charRanges[c];
                    const top = lineCy[r.line] - lineHeight / 2;
                    const bot = lineCy[r.line] + lineHeight / 2;
                    if (y >= top && y < bot && x >= r.start && x < r.end) {
                        li = c;
                        break;
                    }
                }
                if (li < 0) continue;
                dots.push({ x, y, letter: li, dx: 0, dy: 0 });
            }
        }
    }

    const rand = seededRandom(1234);
    for (const d of dots) {
        d.speckle = rand() < 0.08;
        d.phase = rand() * Math.PI * 2;
        d.twinkle = rand() < 0.3;
    }

    return { dots, W, H, charRanges, lineCy, icons };
};

const loadIcon = (key) =>
    new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = `/public/icons/${key}-monogram.svg`;
    });

const PixelTitle = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        let field = null;
        let letterState = [];
        let iconState = [];
        let iconImgs = {};
        let rafId = 0;
        let disposed = false;
        const mouse = { x: 0, y: 0, active: false, speed: 0 };
        let lastMoveAt = 0;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const tmp = { tx: 0, ty: 0 };
        const repel = (cx, cy, boost) => {
            // Only scatter the dots while the pointer is actually over the title.
            // Once it leaves, the field relaxes back to the resting positions.
            if (!mouse.active) {
                tmp.tx = 0;
                tmp.ty = 0;
                return;
            }
            const dx = cx - mouse.x;
            const dy = cy - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < REPEL_RADIUS && dist > 0.001) {
                const f = 1 - dist / REPEL_RADIUS;
                const push = f * f * REPEL_STRENGTH * boost;
                const ux = dx / dist;
                const uy = dy / dist;
                const sw = f * REPEL_STRENGTH * SWIRL * boost;
                tmp.tx = ux * push + -uy * sw;
                tmp.ty = uy * push + ux * sw;
                return;
            }
            tmp.tx = 0;
            tmp.ty = 0;
        };

        const update = () => {
            const { dots, icons } = field;
            const boost = 1 + Math.min(mouse.speed / 1500, 1.2);
            mouse.speed *= 0.92;
            for (const d of dots) {
                repel(d.x, d.y, boost);
                d.dx += (tmp.tx - d.dx) * LERP;
                d.dy += (tmp.ty - d.dy) * LERP;
            }
            for (const [i, ic] of icons.entries()) {
                repel(ic.x + ic.w / 2, ic.y + ic.h / 2, boost);
                const st = iconState[i];
                st.dx += (tmp.tx - st.dx) * LERP;
                st.dy += (tmp.ty - st.dy) * LERP;
            }
        };

        const render = () => {
            if (!field) return;
            const { dots, W, H, icons } = field;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);

            const now = performance.now() / 1000;
            for (const d of dots) {
                const st = letterState[d.letter];
                if (!st || st.enterO <= 0.01) continue;
                let alpha = st.enterO;
                if (d.twinkle) alpha *= 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(now * 2 + d.phase));
                ctx.globalAlpha = alpha;
                ctx.fillStyle = d.speckle ? DOT_SPECKLE : DOT_BASE;
                ctx.beginPath();
                ctx.arc(d.x + d.dx, d.y + d.dy, DOT_R, 0, Math.PI * 2);
                ctx.fill();
            }

            for (const [i, ic] of icons.entries()) {
                const st = iconState[i];
                const img = iconImgs[ic.key];
                if (!img || st.enterO <= 0.01) continue;
                const pulse = 0.5 + 0.5 * Math.sin(now * 2 + i * Math.PI);
                ctx.save();
                ctx.globalAlpha = st.enterO;
                ctx.shadowColor = "rgba(56, 189, 248, 0.55)";
                ctx.shadowBlur = 10 + 8 * pulse;
                ctx.translate(ic.x + ic.w / 2 + st.dx, ic.y + ic.h / 2 + st.dy + st.enterY);
                ctx.rotate((st.enterRot * Math.PI) / 180);
                ctx.drawImage(img, -ic.w / 2, -ic.h / 2, ic.w, ic.h);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
        };

        const loop = () => {
            update();
            render();
            rafId = requestAnimationFrame(loop);
        };

        const toLogical = (clientX, clientY) => {
            const r = canvas.getBoundingClientRect();
            return {
                x: ((clientX - r.left) / r.width) * field.W,
                y: ((clientY - r.top) / r.height) * field.H,
            };
        };

        const setPointer = (x, y) => {
            const now = performance.now();
            const dt = Math.max((now - lastMoveAt) / 1000, 0.008);
            const vx = (x - mouse.x) / dt;
            const vy = (y - mouse.y) / dt;
            mouse.speed += (Math.hypot(vx, vy) - mouse.speed) * 0.5;
            lastMoveAt = now;
            mouse.x = x;
            mouse.y = y;
            mouse.active = true;
        };
        const onMove = (e) => {
            const p = toLogical(e.clientX, e.clientY);
            setPointer(p.x, p.y);
        };
        const onTouch = (e) => {
            const t = e.touches && e.touches[0];
            if (!t) return;
            const p = toLogical(t.clientX, t.clientY);
            setPointer(p.x, p.y);
        };
        const onLeave = () => {
            mouse.active = false;
            mouse.speed = 0;
        };

        const init = async () => {
            try {
                if (document.fonts && document.fonts.load) {
                    await document.fonts.load(`800 ${FONT_SIZE}px Georama`);
                }
            } catch {
                /* fall back to the system font */
            }
            if (disposed) return;
            const [aImg, jImg] = await Promise.all([loadIcon("a"), loadIcon("j")]);
            if (disposed) return;
            iconImgs = { a: aImg, j: jImg };
            field = buildField();
            letterState = field.charRanges.map(() => ({ enterO: 0 }));
            iconState = field.icons.map(() => ({ enterY: 0, enterRot: 0, enterO: 0, dx: 0, dy: 0 }));

            if (reduced) {
                letterState.forEach((s) => {
                    s.enterO = 1;
                });
                iconState.forEach((s) => {
                    s.enterO = 1;
                });
            } else {
                // A + J monograms: one-time gravity-fall + 360° spin (same motion as boot).
                iconState.forEach((s, k) => {
                    gsap.fromTo(
                        s,
                        { enterY: -Math.min(window.innerHeight * 0.85, 640), enterRot: 0, enterO: 0 },
                        { enterY: 0, enterRot: 360, enterO: 1, duration: 2.2, ease: "bounce.out", delay: k * 0.26 }
                    );
                });
                // Text dots stagger in after the monograms land.
                gsap.to(letterState, { enterO: 1, duration: 0.5, ease: "power2.out", stagger: 0.05, delay: 0.6 });
            }

            if (!reduced) {
                canvas.addEventListener("mousemove", onMove);
                canvas.addEventListener("mouseleave", onLeave);
                canvas.addEventListener("touchstart", onTouch, { passive: true });
                canvas.addEventListener("touchmove", onTouch, { passive: true });
                canvas.addEventListener("touchend", onLeave, { passive: true });
                canvas.addEventListener("touchcancel", onLeave, { passive: true });
            }

            rafId = requestAnimationFrame(loop);
        };

        init();

        return () => {
            disposed = true;
            cancelAnimationFrame(rafId);
            gsap.killTweensOf(letterState);
            gsap.killTweensOf(iconState);
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mouseleave", onLeave);
            canvas.removeEventListener("touchstart", onTouch);
            canvas.removeEventListener("touchmove", onTouch);
            canvas.removeEventListener("touchend", onLeave);
            canvas.removeEventListener("touchcancel", onLeave);
        };
    }, []);

    return <canvas ref={canvasRef} className="pixel-title-canvas" aria-label="Adam Jemmali" />;
};

export default PixelTitle;

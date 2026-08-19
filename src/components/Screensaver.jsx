import { Fragment, useEffect, useRef, useState } from "react";

// Canvas screensaver modules, in the classic idle-screensaver spirit
// (matrix rain / growing pipes / drifting bubbles / warp-speed starfield).
// One is picked at random each time the screen suspends and runs until the
// screen wakes.

const PALETTE = ["#4bd5ea", "#a78bfa", "#f472b6", "#fbbf24", "#4ade80", "#60a5fa"];
const MATRIX_CHARS = "アイウエオカキクケコサシスセソ0123456789#*+ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const runMatrix = (canvas, ctx) => {
    const fontSize = 16;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let columns = Math.max(1, Math.floor(canvas.width / fontSize));
    let drops = Array.from({ length: columns }, () => Math.floor((Math.random() * canvas.height) / fontSize) * -1);

    let raf;
    const draw = () => {
        if (columns !== Math.max(1, Math.floor(canvas.width / fontSize))) {
            columns = Math.max(1, Math.floor(canvas.width / fontSize));
            drops = Array.from({ length: columns }, () => Math.floor((Math.random() * canvas.height) / fontSize) * -1);
        }
        ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < columns; i++) {
            const char = MATRIX_CHARS[(Math.random() * MATRIX_CHARS.length) | 0];
            const y = drops[i] * fontSize;
            ctx.fillStyle = Math.random() > 0.95 ? "#e8fff0" : "#22c55e";
            ctx.fillText(char, i * fontSize, y);
            drops[i] = y > canvas.height && Math.random() > 0.975 ? 0 : drops[i] + 1;
        }
        raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
};

const runPipes = (canvas, ctx) => {
    const GRID = 20;
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const makeWorm = () => ({
        x: (Math.random() * Math.floor(canvas.width / GRID)) | 0,
        y: (Math.random() * Math.floor(canvas.height / GRID)) | 0,
        dir: (Math.random() * 4) | 0,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        steps: 0,
        max: 40 + ((Math.random() * 70) | 0),
    });

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const worms = Array.from({ length: 6 }, makeWorm);
    let raf;
    let tick = 0;
    const draw = () => {
        tick++;
        const cols = Math.floor(canvas.width / GRID);
        const rows = Math.floor(canvas.height / GRID);

        // Periodically wipe the board so pipes don't clutter forever.
        if (tick % 900 === 0) ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (tick % 2 === 0) {
            worms.forEach((w, idx) => {
                if (Math.random() < 0.12) w.dir = (Math.random() * 4) | 0;
                const [dx, dy] = DIRS[w.dir];
                const nx = w.x + dx;
                const ny = w.y + dy;
                ctx.strokeStyle = w.color;
                ctx.lineWidth = 6;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(w.x * GRID + GRID / 2, w.y * GRID + GRID / 2);
                ctx.lineTo(nx * GRID + GRID / 2, ny * GRID + GRID / 2);
                ctx.stroke();
                w.x = nx;
                w.y = ny;
                w.steps++;
                if (w.x < 0 || w.x >= cols || w.y < 0 || w.y >= rows || w.steps > w.max) {
                    worms[idx] = makeWorm();
                }
            });
        }
        raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
};

const runBubbles = (canvas, ctx) => {
    const bubbles = Array.from({ length: 26 }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * canvas.height,
        r: 6 + Math.random() * 30,
        speed: 0.3 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 0.4,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
    }));

    let raf;
    const draw = () => {
        ctx.fillStyle = "#0b1526";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        bubbles.forEach((b) => {
            b.y -= b.speed;
            b.x += b.drift;
            if (b.y + b.r < 0) {
                b.y = canvas.height + b.r;
                b.x = Math.random() * canvas.width;
            }
            const grad = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.1, b.x, b.y, b.r);
            grad.addColorStop(0, "rgba(255,255,255,0.55)");
            grad.addColorStop(0.45, `${b.color}aa`);
            grad.addColorStop(1, `${b.color}22`);
            ctx.beginPath();
            ctx.fillStyle = grad;
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        });
        raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
};

const runWarp = (canvas, ctx) => {
    const SPEED = 8;
    const placeStar = (s, z) => {
        s.x = (Math.random() - 0.5) * canvas.width;
        s.y = (Math.random() - 0.5) * canvas.height;
        s.z = z;
        return s;
    };
    // Staggered initial depths so stars don't all restart in sync.
    const stars = Array.from({ length: 260 }, () => placeStar({}, Math.random() * canvas.width));

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let raf;
    const draw = () => {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach((s) => {
            const pz = s.z;
            s.z -= SPEED;
            if (s.z <= 1) {
                placeStar(s, canvas.width);
                return;
            }
            const sx = (s.x / s.z) * cx + cx;
            const sy = (s.y / s.z) * cx + cy;
            const px = (s.x / pz) * cx + cx;
            const py = (s.y / pz) * cx + cy;
            const brightness = Math.min(1, (canvas.width - s.z) / canvas.width);

            ctx.strokeStyle = `rgba(150, 175, 255, ${brightness})`;
            ctx.lineWidth = Math.max(0.5, brightness * 2);
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(sx, sy);
            ctx.stroke();

            if (brightness > 0.85 && Math.random() < 0.03) {
                ctx.fillStyle = "rgba(210, 225, 255, 0.9)";
                ctx.beginPath();
                ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
};

const RUNNERS = { matrix: runMatrix, pipes: runPipes, bubbles: runBubbles, warp: runWarp };
const MODULE_IDS = Object.keys(RUNNERS);

// Pass `module` ("matrix" | "pipes" | "bubbles" | "warp") to pin a specific
// one — used when it's picked as a desktop wallpaper. Omit it to pick one at
// random, which is what the suspend screen does.
const Screensaver = ({ module, className = "" }) => {
    const canvasRef = useRef(null);
    const [picked] = useState(() => module ?? MODULE_IDS[(Math.random() * MODULE_IDS.length) | 0]);
    const run = RUNNERS[picked] ?? runMatrix;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const stop = run(canvas, ctx);
        return () => {
            window.removeEventListener("resize", resize);
            stop();
        };
    }, [run]);

    return (
        <Fragment>
            <canvas ref={canvasRef} className={`screensaver-canvas ${className}`.trim()} aria-hidden="true" />
            {picked === "warp" && (
                <div className="screensaver-brand" aria-hidden="true">
                    <span className="screensaver-brand-spark">✦</span> AJ OS
                </div>
            )}
        </Fragment>
    );
};

export { MODULE_IDS };
export default Screensaver;

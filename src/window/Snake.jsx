import { useCallback, useEffect, useRef, useState } from "react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";

const COLS = 20;
const ROWS = 20;
const CELL = 20;

const KEYS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
};

const spawnApple = (snake) => {
    let pos;
    do {
        pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
};

const Snake = () => {
    const canvasRef = useRef(null);
    const [phase, setPhase] = useState("ready"); // ready | playing | over
    const [score, setScore] = useState(0);
    const [high, setHigh] = useState(() => Number(localStorage.getItem("mj-snake-high")) || 0);

    const snakeRef = useRef([]);
    const dirRef = useRef({ x: 1, y: 0 });
    const nextDirRef = useRef({ x: 1, y: 0 });
    const appleRef = useRef(null);
    const lastRef = useRef(0);
    const focused = useWindowStore((s) => s.focusedWindow === "snake");

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#0b0f14";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        for (let i = 1; i < COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL, 0);
            ctx.lineTo(i * CELL, canvas.height);
            ctx.stroke();
        }
        for (let i = 1; i < ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * CELL);
            ctx.lineTo(canvas.width, i * CELL);
            ctx.stroke();
        }

        // Apple
        const apple = appleRef.current;
        if (apple) {
            ctx.fillStyle = "#ff5f57";
            ctx.beginPath();
            ctx.arc(apple.x * CELL + CELL / 2, apple.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Snake
        snakeRef.current.forEach((seg, i) => {
            ctx.fillStyle = i === 0 ? "#86efac" : "#22c55e";
            ctx.beginPath();
            ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
            ctx.fill();
        });
    }, []);

    const endGame = useCallback(() => {
        setPhase("over");
        setHigh((prev) => {
            const best = Math.max(prev, score);
            localStorage.setItem("mj-snake-high", String(best));
            return best;
        });
    }, [score]);

    const stepGame = useCallback(() => {
        const dir = nextDirRef.current;
        dirRef.current = dir;
        const head = snakeRef.current[0];
        const next = { x: head.x + dir.x, y: head.y + dir.y };

        if (next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS) return endGame();
        if (snakeRef.current.some((s) => s.x === next.x && s.y === next.y)) return endGame();

        snakeRef.current.unshift(next);
        if (appleRef.current && next.x === appleRef.current.x && next.y === appleRef.current.y) {
            setScore((s) => s + 10);
            appleRef.current = spawnApple(snakeRef.current);
        } else {
            snakeRef.current.pop();
        }
        draw();
    }, [draw, endGame]);

    const start = useCallback(() => {
        snakeRef.current = [
            { x: 7, y: 10 },
            { x: 6, y: 10 },
            { x: 5, y: 10 },
            { x: 4, y: 10 },
        ];
        dirRef.current = { x: 1, y: 0 };
        nextDirRef.current = { x: 1, y: 0 };
        appleRef.current = spawnApple(snakeRef.current);
        setScore(0);
        setPhase("playing");
        draw();
    }, [draw]);

    // Game loop.
    useEffect(() => {
        if (phase !== "playing") return;
        lastRef.current = performance.now();
        let raf;

        const tick = (now) => {
            const speed = Math.max(65, 150 - score * 1.5);
            if (now - lastRef.current >= speed) {
                lastRef.current = now;
                stepGame();
            }
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [phase, score, stepGame]);

    // Keyboard input (only while this window is focused).
    useEffect(() => {
        if (!focused) return;

        const onKey = (e) => {
            const dir = KEYS[e.key];
            if (!dir) {
                if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    if (phase !== "playing") start();
                }
                return;
            }
            e.preventDefault();
            const current = dirRef.current;
            if (dir.x === -current.x && dir.y === -current.y) return; // no reversing
            nextDirRef.current = dir;
            if (phase !== "playing") start();
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [focused, phase, start]);

    // First paint when the window opens.
    useEffect(() => {
        if (!snakeRef.current.length) {
            snakeRef.current = [
                { x: 7, y: 10 },
                { x: 6, y: 10 },
                { x: 5, y: 10 },
                { x: 4, y: 10 },
            ];
            appleRef.current = spawnApple(snakeRef.current);
        }
        draw();
    }, [draw]);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="snake" />
                <h2>Snake — don't crash</h2>
            </div>

            <div className="snake-body">
                <div className="snake-score">
                    <span>score <b>{score}</b></span>
                    <span>high <b>{high}</b></span>
                </div>

                <div className="snake-wrap">
                    <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} />
                    {phase !== "playing" && (
                        <div className="snake-overlay">
                            <h3>{phase === "over" ? "Game over" : "Snake"}</h3>
                            <p>
                                {phase === "over"
                                    ? `You scored ${score}. Nice run!`
                                    : "Eat the red dot, don't hit the walls or yourself."}
                            </p>
                            <button type="button" className="snake-start" onClick={start}>
                                {phase === "over" ? "Play again" : "Start"}
                            </button>
                            <p className="!mt-0 opacity-60">arrows / WASD · space to start</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const SnakeWindow = WindowWrapper(Snake, "snake");
export default SnakeWindow;

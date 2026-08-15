import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";
import { SNAKE_GRID, SNAKE_SPEED, initialSnake, spawnApple, stepSnake, drawSnake } from "#game/snake.js";

const { COLS, ROWS, CELL } = SNAKE_GRID;

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

const Snake = () => {
    const canvasRef = useRef(null);
    const [phase, setPhase] = useState("ready"); // ready | playing | over
    const [score, setScore] = useState(0);
    const [high, setHigh] = useState(() => Number(localStorage.getItem("mj-snake-high")) || 0);

    const [started, setStarted] = useState(false);

    const snakeRef = useRef([]);
    const dirRef = useRef({ x: 0, y: 0 });
    const nextDirRef = useRef({ x: 0, y: 0 });
    const movingRef = useRef(false);
    const appleRef = useRef(null);
    const lastRef = useRef(0);
    const focused = useWindowStore((s) => s.focusedWindow === "snake");

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        drawSnake(ctx, {
            snake: snakeRef.current,
            apple: appleRef.current,
            cell: CELL,
            headColor: "#86efac",
            bodyColor: "#22c55e",
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

        const result = stepSnake(snakeRef.current, dir, appleRef.current, COLS, ROWS);
        if (result.dead) return endGame();

        snakeRef.current = result.snake;
        if (result.ate) {
            setScore((s) => s + 10);
            appleRef.current = spawnApple(snakeRef.current, COLS, ROWS);
        }
        draw();
    }, [draw, endGame]);

    // Start places the snake but it stays still until the first direction input.
    const start = useCallback(() => {
        snakeRef.current = initialSnake();
        dirRef.current = { x: 0, y: 0 };
        nextDirRef.current = { x: 0, y: 0 };
        movingRef.current = false;
        setStarted(false);
        appleRef.current = spawnApple(snakeRef.current);
        setScore(0);
        setPhase("playing");
        draw();
    }, [draw]);

    const turn = useCallback((direction) => {
        if (phase !== "playing") start();
        const current = movingRef.current ? dirRef.current : null;
        if (current && direction.x === -current.x && direction.y === -current.y) return;
        dirRef.current = direction;
        nextDirRef.current = direction;
        movingRef.current = true;
        setStarted(true);
    }, [phase, start]);

    // Game loop (timer-based so it keeps running in throttled/background tabs).
    useEffect(() => {
        if (phase !== "playing") return;
        lastRef.current = performance.now();

        const id = setInterval(() => {
            const now = performance.now();
            const speed = Math.max(SNAKE_SPEED.MIN, SNAKE_SPEED.BASE - score * 1.5);
            if (now - lastRef.current >= speed) {
                lastRef.current = now;
                if (movingRef.current) stepGame();
            }
        }, 32);

        return () => clearInterval(id);
    }, [phase, score, stepGame]);

    // Keyboard input (only while this window is focused).
    useEffect(() => {
        if (!focused) return;

        const onKey = (e) => {
            // Normalize WASD so Caps Lock / Shift doesn't break input.
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            const dir = KEYS[key];
            if (!dir) {
                if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    if (phase !== "playing") start();
                }
                return;
            }
            e.preventDefault();
            turn(dir);
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [focused, phase, start, turn]);

    // First paint when the window opens.
    useEffect(() => {
        if (!snakeRef.current.length) {
            snakeRef.current = initialSnake();
            appleRef.current = spawnApple(snakeRef.current);
        }
        draw();
    }, [draw]);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="snake" />
                <h2>Snake</h2>
            </div>

            <div className="snake-body">
                <div className="snake-score">
                    <span>score <b>{score}</b></span>
                    <span>high <b>{high}</b></span>
                </div>

                <div className="snake-wrap">
                    <canvas ref={canvasRef} width={COLS * CELL} height={ROWS * CELL} />
                    {phase === "ready" && (
                        <div className="snake-overlay">
                            <h3>Snake</h3>
                            <p>Eat the red dot, don't hit the walls or yourself.</p>
                            <button type="button" className="snake-start" onClick={start}>
                                Start
                            </button>
                            <p className="!mt-0 opacity-60">arrows / WASD · space to start</p>
                        </div>
                    )}

                    {phase === "playing" && !started && (
                        <div className="snake-overlay">
                            <h3>Ready</h3>
                            <p>Press arrows or WASD to move</p>
                        </div>
                    )}

                    {phase === "over" && (
                        <div className="snake-overlay">
                            <h3>Game over</h3>
                            <p>You scored {score}. Nice run!</p>
                            <button type="button" className="snake-start" onClick={start}>
                                Play again
                            </button>
                        </div>
                    )}
                </div>

                <div className="snake-controls" aria-label="Snake controls">
                    <button
                        type="button"
                        className="snake-control snake-control-up"
                        aria-label="Move up"
                        onClick={() => turn(KEYS.ArrowUp)}
                    >
                        <ChevronUp size={18} />
                    </button>
                    <button
                        type="button"
                        className="snake-control snake-control-left"
                        aria-label="Move left"
                        onClick={() => turn(KEYS.ArrowLeft)}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        className="snake-control snake-control-down"
                        aria-label="Move down"
                        onClick={() => turn(KEYS.ArrowDown)}
                    >
                        <ChevronDown size={18} />
                    </button>
                    <button
                        type="button"
                        className="snake-control snake-control-right"
                        aria-label="Move right"
                        onClick={() => turn(KEYS.ArrowRight)}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};

const SnakeWindow = WindowWrapper(Snake, "snake");
export default SnakeWindow;

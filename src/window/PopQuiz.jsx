import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Clock,
    GripVertical,
    MousePointer2,
    Play,
    RotateCcw,
    SkipForward,
    Terminal,
    Timer,
    Trash2,
    Waypoints,
    X,
} from "lucide-react";
import WindowsControls from "#components/WindowsControls.jsx";
import { Owl } from "#components/AppMascots.jsx";
import { EasyIcon, NormalIcon, HardIcon, AllIcon } from "#components/GameIcons.jsx";
import { SystemDesignIcon, FullStackIcon, CodingIcon, WebIcon, LanguageIcon } from "#components/QuizIcons.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { DIFFICULTIES, QUIZ_CATEGORIES, prepareQuestion, quizPool, shuffleDeck } from "#game/popquiz.js";
import { playClick, playWhoosh } from "#utils/sound.js";
import { recordGameResult } from "#game/highscores.js";
import { hashSeed, roughArrowHead, roughLinePaths, roughRectPaths } from "#utils/rough.js";

const norm = (s) => s.trim().toLowerCase().replace(/[\s.'"-]+/g, "");

const DIFFICULTY_ICONS = { easy: EasyIcon, normal: NormalIcon, hard: HardIcon };
const CATEGORY_ICONS = {
    "system-design": SystemDesignIcon,
    "full-stack": FullStackIcon,
    coding: CodingIcon,
    web: WebIcon,
    languages: LanguageIcon,
};

// Results-screen portrait: the owl mascot celebrating, with a few sparkles.
const OwlVictoryScene = () => (
    <div className="popquiz-victory">
        <Owl className="popquiz-victory-owl" />
        <span className="spark-glyph">✦</span>
        <span className="spark-glyph">✦</span>
        <span className="spark-glyph">✦</span>
    </div>
);

// Opening portrait — the owl mascot mulling over a question before you start.
const OwlReadyScene = () => (
    <div className="popquiz-victory">
        <Owl className="popquiz-victory-owl" />
        <span className="quiz-think-mark">?</span>
    </div>
);

const BEST_KEY = "mj-popquiz-bests";
const readBests = () => {
    try {
        return JSON.parse(localStorage.getItem(BEST_KEY)) || {};
    } catch {
        return {};
    }
};
const bestKey = (cat, diff) => `${cat}|${diff}`;

// The longest a single run can be. Players pick 5/10/15 on the setup screen
// and the deck never exceeds this cap, so repeat plays stay fresh instead of
// burning through the whole pool.
const DECK_CAP = 15;
const QUIZ_LENGTHS = [5, 10, 15];

const edgeKey = (a, b) => `${a}|${b}`;
let markerCounter = 0;
let shapeCounter = 0;
const nextShapeId = () => `s${++shapeCounter}`;

// Mini architecture diagram. Read only for the order questions.
const ArchDiagram = ({ nodes, edges }) => {
    const wrapRef = useRef(null);
    const [positions, setPositions] = useState({});
    const markerId = useRef(`arch-arrow-${++markerCounter}`).current;

    useLayoutEffect(() => {
        const measure = () => {
            const wrap = wrapRef.current;
            if (!wrap) return;
            const rect = wrap.getBoundingClientRect();
            const next = {};
            nodes.forEach((n) => {
                const el = wrap.querySelector(`[data-node="${n.id}"]`);
                if (!el) return;
                const r = el.getBoundingClientRect();
                next[n.id] = { x: r.left - rect.left + r.width / 2, y: r.top - rect.top + r.height / 2 };
            });
            setPositions(next);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [nodes]);

    return (
        <div ref={wrapRef} className="arch-diagram compact">
            <svg className="arch-svg">
                <defs>
                    <marker
                        id={markerId}
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="7"
                        markerHeight="7"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" className="arch-arrow" />
                    </marker>
                </defs>
                {edges.map(([a, b]) => {
                    const p1 = positions[a];
                    const p2 = positions[b];
                    if (!p1 || !p2) return null;
                    return (
                        <line
                            key={edgeKey(a, b)}
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            className="arch-line"
                            markerEnd={`url(#${markerId})`}
                        />
                    );
                })}
            </svg>
            {nodes.map((n) => (
                <span
                    key={n.id}
                    data-node={n.id}
                    className="arch-node"
                    style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                    {n.label}
                </span>
            ))}
        </div>
    );
};

// Small hand drawn shape glyphs for the Excalidraw style draw questions.
const ShapeGlyph = ({ label }) => {
    const l = label.toLowerCase();
    if (l.includes("database") || l.includes("history") || l.includes("store")) {
        return (
            <svg viewBox="0 0 16 16" className="draw-glyph" aria-hidden="true">
                <ellipse cx="8" cy="4.4" rx="5.2" ry="2.1" fill="none" stroke="currentColor" />
                <path d="M2.8 4.4v6.8c0 1.2 2.3 2.2 5.2 2.2s5.2-1 5.2-2.2V4.4" fill="none" stroke="currentColor" />
                <path d="M2.8 7.8c0 1.2 2.3 2.2 5.2 2.2s5.2-1 5.2-2.2" fill="none" stroke="currentColor" />
            </svg>
        );
    }
    if (l.includes("queue")) {
        return (
            <svg viewBox="0 0 16 16" className="draw-glyph" aria-hidden="true">
                <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        );
    }
    if (l.includes("cache") || l.includes("redis")) {
        return (
            <svg viewBox="0 0 16 16" className="draw-glyph" aria-hidden="true">
                <path d="M8 2.5 13 8l-5 5.5L3 8z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
        );
    }
    if (l.includes("client") || l.includes("user")) {
        return (
            <svg viewBox="0 0 16 16" className="draw-glyph" aria-hidden="true">
                <circle cx="8" cy="4.6" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M3 14c0-2.76 2.24-5 5-5s5 2.24 5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        );
    }
    if (l.includes("load balancer")) {
        return (
            <svg viewBox="0 0 16 16" className="draw-glyph" aria-hidden="true">
                <circle cx="8" cy="8" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5.4 5.4 10.6 10.6M10.6 5.4 5.4 10.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
        );
    }
    if (l.includes("cdn") || l.includes("web")) {
        return (
            <svg viewBox="0 0 16 16" className="draw-glyph" aria-hidden="true">
                <circle cx="8" cy="8" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <ellipse cx="8" cy="8" rx="2.6" ry="5.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2.6 8h10.8" stroke="currentColor" strokeWidth="1.4" />
            </svg>
        );
    }
    // Default: server box.
    return (
        <svg viewBox="0 0 16 16" className="draw-glyph" aria-hidden="true">
            <rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="5.8" cy="8" r="0.9" fill="currentColor" />
            <circle cx="8.6" cy="8" r="0.9" fill="currentColor" />
        </svg>
    );
};

// SVG border that draws a seeded, hand-drawn rectangle around whatever box
// it is rendered in — the Excalidraw "rough" look.
const RoughBorder = ({ seed, className = "" }) => {
    const ref = useRef(null);
    const [box, setBox] = useState(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => {
            // clientWidth/Height (not offsetWidth/Height): they return the real
            // box for SVG elements, while offset* is always 0 on SVGs.
            const w = el.clientWidth;
            const h = el.clientHeight;
            if (w > 0 && h > 0) {
                setBox((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
            }
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const paths = box ? roughRectPaths(0, 0, box.w, box.h, seed) : [];
    return (
        <svg
            ref={ref}
            className={`draw-rough-border ${className}`}
            viewBox={box ? `0 0 ${box.w} ${box.h}` : undefined}
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            {paths.map((d, i) => (
                <path key={i} d={d} className={i === 0 ? "draw-rough-path" : "draw-rough-path second"} />
            ))}
        </svg>
    );
};

// Lay a palette + edges out left to right: each node sits in the column of
// its longest path from a source, rows spread evenly per column. Only the
// nodes the answer actually uses are laid out — palette extras stay off.
const layoutDiagram = (palette, edges) => {
    const uniqEdges = [...new Set(edges.map(([a, b]) => `${a}|${b}`))].map((key) => key.split("|"));
    const used = new Set();
    uniqEdges.forEach(([a, b]) => {
        used.add(a);
        used.add(b);
    });
    const nodes = used.size ? palette.filter((id) => used.has(id)) : palette;
    const inEdges = {};
    nodes.forEach((id) => {
        inEdges[id] = [];
    });
    uniqEdges.forEach(([a, b]) => {
        inEdges[b] = inEdges[b] || [];
        inEdges[b].push(a);
    });
    const layer = {};
    const depth = (id) => {
        if (layer[id] !== undefined) return layer[id];
        const ins = inEdges[id] || [];
        layer[id] = ins.length ? 1 + Math.max(...ins.map(depth)) : 0;
        return layer[id];
    };
    nodes.forEach((id) => depth(id));
    const maxLayer = Math.max(...nodes.map((id) => layer[id]), 0);
    const byLayer = {};
    nodes.forEach((id) => {
        (byLayer[layer[id]] = byLayer[layer[id]] || []).push(id);
    });
    const laidOut = nodes.map((id) => {
        const column = byLayer[layer[id]];
        return {
            id,
            label: id,
            // Keep the last column well inside the box so wide labels like
            // "WebSocket Servers" aren't clipped by the diagram's overflow.
            x: maxLayer === 0 ? 50 : 8 + (layer[id] / maxLayer) * 76,
            y: ((column.indexOf(id) + 1) / (column.length + 1)) * 100,
        };
    });
    return { nodes: laidOut, edges: uniqEdges };
};

// The correct answer diagram for a missed draw question: nodes laid out left
// to right, rough connectors with arrows, and annotation notes underneath.
const ReviewDiagram = ({ question }) => {
    const wrapRef = useRef(null);
    const [positions, setPositions] = useState({});
    const layout = useMemo(() => layoutDiagram(question.palette, question.edges), [question]);

    useLayoutEffect(() => {
        const measure = () => {
            const wrap = wrapRef.current;
            if (!wrap) return;
            const rect = wrap.getBoundingClientRect();
            const next = {};
            layout.nodes.forEach((n) => {
                const el = wrap.querySelector(`[data-review-node="${n.id}"]`);
                if (!el) return;
                const r = el.getBoundingClientRect();
                next[n.id] = { x: r.left - rect.left + r.width / 2, y: r.top - rect.top + r.height / 2 };
            });
            setPositions(next);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, [layout]);

    return (
        <>
            <div ref={wrapRef} className="review-diagram">
                <svg className="review-svg">
                    {layout.edges.map(([a, b]) => {
                        const p1 = positions[a];
                        const p2 = positions[b];
                        if (!p1 || !p2) return null;
                        const key = edgeKey(a, b);
                        const seed = hashSeed(key);
                        const [d1, d2] = roughLinePaths(p1.x, p1.y, p2.x, p2.y, seed);
                        return (
                            <g key={key} className="draw-line">
                                <path d={d1} />
                                <path d={d2} />
                                <path
                                    d={roughArrowHead(seed + 7)}
                                    className="draw-arrow"
                                    transform={`translate(${p2.x - 10} ${p2.y - 5})`}
                                />
                            </g>
                        );
                    })}
                </svg>
                {layout.nodes.map((n) => (
                    <span
                        key={n.id}
                        data-review-node={n.id}
                        className="review-node"
                        style={{ left: `${n.x}%`, top: `${n.y}%` }}
                    >
                        <RoughBorder seed={hashSeed(`review-${n.id}`)} />
                        <ShapeGlyph label={n.label} />
                        {n.label}
                    </span>
                ))}
            </div>
            {question.annotations?.length > 0 && (
                <div className="review-annotations">
                    {question.annotations.map((note, i) => (
                        <p key={i} className="review-annotation">
                            <svg viewBox="0 0 12 6" aria-hidden="true">
                                <path d="M1 3.5 Q 3 1.5 5 3.5 T 9 3.5" className="review-squiggle" />
                            </svg>
                            <span>{note}</span>
                        </p>
                    ))}
                </div>
            )}
        </>
    );
};

// Excalidraw style draw canvas: pull shapes from the tray onto the canvas,
// move them around, and draw arrows between them with the connect tool.
const DrawCanvas = ({ palette, shapes, edges, onChangeShapes, onToggleEdge, onRemoveShape, onClear, disabled }) => {
    const canvasRef = useRef(null);
    const rootRef = useRef(null);
    const [tool, setTool] = useState("move");
    const [drag, setDrag] = useState(null); // { kind: "place"|"move"|"connect", ... }
    const [hoverId, setHoverId] = useState(null);

    const shapeById = (id) => shapes.find((s) => s.id === id);

    const canvasPoint = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const clampPt = (pt) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: Math.min(Math.max(pt.x, 0), rect.width),
            y: Math.min(Math.max(pt.y, 0), rect.height),
        };
    };

    // Coordinates relative to the whole draw widget, where the drag ghost
    // lives. Using these (instead of position: fixed) keeps the ghost glued
    // to the pointer even though the window itself is transformed.
    const rootPoint = (e) => {
        const rect = rootRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const shapeAt = (e) =>
        document.elementFromPoint(e.clientX, e.clientY)?.closest?.("[data-shape]")?.getAttribute("data-shape") ?? null;

    const removeShape = (id) => {
        onRemoveShape(id);
    };

    // -- Palette chip: pick a shape and drop it onto the canvas. The ghost
    //    follows the pointer 1:1 from the exact grab point, like Excalidraw.
    const onChipPointerDown = (e, label) => {
        if (disabled) return;
        e.preventDefault();
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
            // Pointer capture is best effort; the drag still works without it.
        }
        const chip = e.currentTarget.getBoundingClientRect();
        const g = rootPoint(e);
        setDrag({
            kind: "place",
            label,
            x: e.clientX,
            y: e.clientY,
            gx: g.x,
            gy: g.y,
            gdx: e.clientX - (chip.left + chip.width / 2),
            gdy: e.clientY - (chip.top + chip.height / 2),
        });
    };

    const onChipPointerMove = (e) => {
        if (drag?.kind !== "place") return;
        const g = rootPoint(e);
        setDrag((d) => ({ ...d, x: e.clientX, y: e.clientY, gx: g.x, gy: g.y }));
    };

    const onChipPointerUp = (e) => {
        if (drag?.kind !== "place") return;
        const over = document.elementFromPoint(e.clientX, e.clientY)?.closest?.(".draw-canvas");
        if (over && canvasRef.current) {
            const pt = clampPt({ x: canvasPoint(e).x - drag.gdx, y: canvasPoint(e).y - drag.gdy });
            onChangeShapes([...shapes, { id: nextShapeId(), label: drag.label, x: pt.x, y: pt.y }]);
            playClick();
        }
        setDrag(null);
    };

    // -- Canvas interactions ------------------------------------------
    const onCanvasPointerDown = (e) => {
        if (disabled) return;
        const target = e.target.closest("[data-shape]");
        if (!target) return;
        if (e.target.closest(".draw-shape-remove")) return; // handled by the button click
        const shapeId = target.getAttribute("data-shape");
        const shape = shapeById(shapeId);
        if (!shape) return;
        e.preventDefault();
        const pt = canvasPoint(e);
        if (tool === "move") {
            setDrag({ kind: "move", id: shapeId, x: pt.x, y: pt.y, dx: pt.x - shape.x, dy: pt.y - shape.y });
        } else {
            setDrag({ kind: "connect", from: shapeId, x: pt.x, y: pt.y });
            setHoverId(shapeId);
        }
        try {
            canvasRef.current.setPointerCapture(e.pointerId);
        } catch {
            // Pointer capture is best effort; the drag still works without it.
        }
    };

    const onCanvasPointerMove = (e) => {
        if (!drag) return;
        const pt = canvasPoint(e);
        if (drag.kind === "move") {
            // Follow the pointer 1:1 from the grab point, offset by where the
            // shape was grabbed (dx/dy) — exactly how Excalidraw moves shapes.
            const next = clampPt({ x: pt.x - drag.dx, y: pt.y - drag.dy });
            onChangeShapes(shapes.map((s) => (s.id === drag.id ? { ...s, x: next.x, y: next.y } : s)));
            setDrag((d) => ({ ...d, x: pt.x, y: pt.y }));
        } else if (drag.kind === "connect") {
            const over = shapeAt(e);
            setDrag((d) => ({ ...d, x: pt.x, y: pt.y }));
            setHoverId(over && over !== drag.from ? over : null);
        }
    };

    const onCanvasPointerUp = (e) => {
        if (!drag) return;
        if (drag.kind === "connect") {
            const over = shapeAt(e);
            setHoverId(null);
            if (over && over !== drag.from) onToggleEdge(drag.from, over);
        }
        setDrag(null);
    };

    const clearAll = () => {
        if (disabled) return;
        onClear();
    };

    const dragShape = drag?.kind === "connect" ? shapeById(drag.from) : null;

    return (
        <div ref={rootRef} className={`popquiz-draw ${disabled ? "is-done" : ""}`}>
            <div className="draw-toolbar">
                <div className="draw-tools">
                    <button
                        type="button"
                        className={`draw-tool ${tool === "move" ? "active" : ""}`}
                        onClick={() => setTool("move")}
                        disabled={disabled}
                        aria-pressed={tool === "move"}
                    >
                        <MousePointer2 size={13} />
                        Move
                    </button>
                    <button
                        type="button"
                        className={`draw-tool ${tool === "connect" ? "active" : ""}`}
                        onClick={() => setTool("connect")}
                        disabled={disabled}
                        aria-pressed={tool === "connect"}
                    >
                        <Waypoints size={13} />
                        Connect
                    </button>
                </div>
                <button
                    type="button"
                    className="draw-clear"
                    onClick={clearAll}
                    disabled={disabled || (shapes.length === 0 && edges.length === 0)}
                >
                    <Trash2 size={13} />
                    Clear all
                </button>
            </div>

            <div className="draw-palette">
                {palette.map((label, i) => (
                    <button
                        key={`${label}-${i}`}
                        type="button"
                        className="draw-chip"
                        disabled={disabled}
                        onPointerDown={(e) => onChipPointerDown(e, label)}
                        onPointerMove={onChipPointerMove}
                        onPointerUp={onChipPointerUp}
                        onPointerCancel={() => setDrag(null)}
                    >
                        <ShapeGlyph label={label} />
                        {label}
                    </button>
                ))}
            </div>

            <div
                ref={canvasRef}
                className={`draw-canvas tool-${tool}`}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerCancel={() => setDrag(null)}
            >
                <svg className="draw-svg">
                    {edges.map(([a, b]) => {
                        const p1 = shapeById(a);
                        const p2 = shapeById(b);
                        if (!p1 || !p2) return null;
                        const key = edgeKey(a, b);
                        const seed = hashSeed(key);
                        const [d1, d2] = roughLinePaths(p1.x, p1.y, p2.x, p2.y, seed);
                        return (
                            <g key={key} className="draw-line">
                                <path d={d1} />
                                <path d={d2} />
                                <path
                                    d={roughArrowHead(seed + 7)}
                                    className="draw-arrow"
                                    transform={`translate(${p2.x - 10} ${p2.y - 5})`}
                                />
                            </g>
                        );
                    })}
                    {dragShape && drag && drag.kind === "connect" && (
                        <g className="draw-line preview">
                            {roughLinePaths(dragShape.x, dragShape.y, drag.x, drag.y, 0xdeadbeef).map((d, i) => (
                                <path key={i} d={d} />
                            ))}
                        </g>
                    )}
                </svg>

                {shapes.map((s) => (
                    <div
                        key={s.id}
                        data-shape={s.id}
                        className={`draw-shape ${hoverId === s.id && drag?.kind === "connect" ? "is-hovered" : ""}`}
                        style={{ left: s.x, top: s.y }}
                    >
                        <RoughBorder seed={hashSeed(s.id)} />
                        <ShapeGlyph label={s.label} />
                        <span>{s.label}</span>
                        {!disabled && tool === "move" && (
                            <button
                                type="button"
                                className="draw-shape-remove"
                                onClick={() => removeShape(s.id)}
                                aria-label={`Remove ${s.label}`}
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>
                ))}

            </div>

            {drag?.kind === "place" && (
                <div
                    className="draw-ghost"
                    style={{ left: drag.gx - drag.gdx, top: drag.gy - drag.gdy }}
                >
                    <RoughBorder seed={hashSeed(`ghost-${drag.label}`)} />
                    <ShapeGlyph label={drag.label} />
                    {drag.label}
                </div>
            )}
        </div>
    );
};

const PopQuiz = () => {
    const [phase, setPhase] = useState("setup"); // "setup" | "playing" | "done"
    const [category, setCategory] = useState("all");
    const [difficulty, setDifficulty] = useState("normal");
    const [timed, setTimed] = useState(false);
    const [quizLength, setQuizLength] = useState(10);

    const [deck, setDeck] = useState([]);
    const [index, setIndex] = useState(0);
    const [picked, setPicked] = useState(null); // null | -1 (timed out) | option idx | "fill" | "order" | "draw"
    const [fillText, setFillText] = useState("");
    const [orderSteps, setOrderSteps] = useState([]);
    const [drawShapes, setDrawShapes] = useState([]);
    const [drawEdges, setDrawEdges] = useState([]);
    const [history, setHistory] = useState([]); // { q, user, correct, ok } for the review screen
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [bests, setBests] = useState(readBests);
    const [runFloor, setRunFloor] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [lastGain, setLastGain] = useState(0);
    const timeLeftRef = useRef(20);
    const [dragIdx, setDragIdx] = useState(null);
    const [overIdx, setOverIdx] = useState(null);

    const difficultyDef = DIFFICULTIES.find((d) => d.id === difficulty) ?? DIFFICULTIES[1];
    const timeBudget = difficultyDef.timer;

    const question = deck[index];
    const answered = picked !== null;
    const timedOut = picked === -1;

    const isMcq = question?.type === "mcq" || question?.type === "tf";
    const isFill = question?.type === "fill";
    const isOrder = question?.type === "order";
    const isDraw = question?.type === "draw";

    const nodeLabel = (id) => drawShapes.find((s) => s.id === id)?.label ?? id;

    const drawUserKeys = drawEdges
        .map(([a, b]) => `${nodeLabel(a)}|${nodeLabel(b)}`)
        .sort()
        .join(",");
    const drawAnswerKeys = question?.edges
        ? [...question.edges].map(([a, b]) => `${a}|${b}`).sort().join(",")
        : "";

    const correct =
        (isMcq && picked >= 0 && picked === question.answer) ||
        (isFill && picked === "fill" && question.answers.includes(norm(fillText))) ||
        (isOrder && picked === "order" && orderSteps.every((s, i) => s === question.answers[i])) ||
        (isDraw && picked === "draw" && drawUserKeys === drawAnswerKeys);

    const categoryLabel =
        category === "all"
            ? "all topics"
            : QUIZ_CATEGORIES.find((c) => c.id === category)?.label ?? "dev quiz";

    const bestFor = (cat, diff) => bests[bestKey(cat, diff)] || 0;

    const noteBest = (cat, diff, value) => {
        setBests((prev) => {
            const key = bestKey(cat, diff);
            if ((prev[key] || 0) >= value) return prev;
            const next = { ...prev, [key]: value };
            try {
                localStorage.setItem(BEST_KEY, JSON.stringify(next));
            } catch {
                // Storage unavailable — the best score just won't persist.
            }
            return next;
        });
    };

    const computePoints = () => {
        if (!timed) return 10;
        const ratio = Math.max(0, timeLeft / timeBudget);
        return Math.max(5, Math.round(100 * ratio));
    };

    const correctAnswerText = () => {
        if (isMcq) return question.options[question.answer];
        if (isFill) return question.answer[0];
        if (isOrder) return question.answers.join(" → ");
        if (isDraw) return question.edges.map(([a, b]) => `${a} → ${b}`).join(", ");
        return "";
    };

    const record = (ok, user) => {
        setHistory((h) => [...h, { q: question.question, user, correct: correctAnswerText(), ok, question }]);
    };

    const feedbackText = () => {
        if (timedOut) {
            if (isOrder) return `Time's up. The right order is: ${question.answers.join(" → ")}.`;
            if (isFill) return `Time's up. The answer was “${question.answer[0]}”.`;
            if (isDraw) return `Time's up. The correct flow is: ${correctAnswerText()}.`;
            return `Time's up. It was “${question.options[question.answer]}”.`;
        }
        if (correct) {
            if (isOrder) return "Perfect order! Everything's in the right place.";
            if (isFill) return `Nice, “${fillText.trim()}” is right!`;
            if (isDraw) return "Perfect! The architecture is right.";
            if (timed) return `Correct! +${lastGain} pts.`;
            return streak + 1 > 1 ? `Correct! ${streak + 1} in a row.` : "Correct! Nice one.";
        }
        if (isOrder) return `Not quite. The right order is: ${question.answers.join(" → ")}.`;
        if (isFill) return `Not quite. One accepted answer is “${question.answer[0]}”.`;
        if (isDraw) return `Not quite. The correct flow is: ${correctAnswerText()}.`;
        return `Nope. It was “${question.options[question.answer]}”.`;
    };

    const grade = (ok) => {
        const points = ok ? computePoints() : 0;
        if (ok) {
            setCorrectCount((c) => c + 1);
            setScore((s) => s + points);
            noteBest(category, difficulty, score + points);
            setLastGain(points);
            setStreak((s) => {
                const nextStreak = s + 1;
                setBestStreak((b) => Math.max(b, nextStreak));
                return nextStreak;
            });
        } else {
            setStreak(0);
            setLastGain(0);
        }
    };

    const startGame = () => {
        const prepared = shuffleDeck(quizPool(category, difficulty)).map(prepareQuestion);
        const deck = prepared.slice(0, Math.min(quizLength, DECK_CAP));
        setDeck(deck);
        setIndex(0);
        setPicked(null);
        setFillText("");
        setOrderSteps(deck[0]?.steps ?? []);
        setDrawShapes([]);
        setDrawEdges([]);
        setHistory([]);
        setScore(0);
        setCorrectCount(0);
        setStreak(0);
        setBestStreak(0);
        setRunFloor(bestFor(category, difficulty));
        timeLeftRef.current = timeBudget;
        setTimeLeft(timeBudget);
        setLastGain(0);
        setPhase("playing");
    };

    const backToSetup = () => {
        setPhase("setup");
        setPicked(null);
    };

    const pick = (i) => {
        if (answered) return;
        const ok = i === question.answer;
        setPicked(i);
        record(ok, question.options[i]);
        grade(ok);
    };

    const submitFill = () => {
        if (answered || !fillText.trim()) return;
        const ok = question.answers.includes(norm(fillText));
        setPicked("fill");
        record(ok, fillText.trim() || "no answer");
        grade(ok);
    };

    const submitOrder = () => {
        if (answered) return;
        const ok = orderSteps.every((s, i) => s === question.answers[i]);
        setPicked("order");
        record(ok, orderSteps.join(" → "));
        grade(ok);
    };

    const submitDraw = () => {
        if (answered) return;
        const ok = drawUserKeys === drawAnswerKeys;
        setPicked("draw");
        record(
            ok,
            drawEdges.length
                ? drawEdges.map(([a, b]) => `${nodeLabel(a)} → ${nodeLabel(b)}`).join(", ")
                : "no connection"
        );
        grade(ok);
    };

    const toggleEdge = (a, b) => {
        if (answered) return;
        playClick();
        setDrawEdges((prev) => {
            const key = edgeKey(a, b);
            return prev.some(([x, y]) => edgeKey(x, y) === key)
                ? prev.filter(([x, y]) => edgeKey(x, y) !== key)
                : [...prev, [a, b]];
        });
    };

    const clearDraw = () => {
        if (answered) return;
        setDrawShapes([]);
        setDrawEdges([]);
        playWhoosh();
    };

    const removeDrawShape = (id) => {
        if (answered) return;
        setDrawShapes((prev) => prev.filter((s) => s.id !== id));
        setDrawEdges((prev) => prev.filter(([a, b]) => a !== id && b !== id));
        playClick();
    };

    // Pointer based reorder. Reliable in every webview, unlike HTML5 drag and drop.
    const moveStep = (from, to) => {
        if (from === to) return;
        playWhoosh();
        setOrderSteps((prev) => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    };

    const onRowPointerDown = (e, i) => {
        if (answered || e.button !== 0) return;
        if (e.target.closest("button")) return;
        e.preventDefault();
        setDragIdx(i);
        setOverIdx(i);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onRowPointerMove = (e) => {
        if (dragIdx === null) return;
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest(".popquiz-order-row");
        const idx = el ? Number(el.dataset.idx) : null;
        setOverIdx(idx);
    };

    const onRowPointerUp = () => {
        if (dragIdx === null) return;
        if (overIdx !== null && overIdx !== dragIdx) moveStep(dragIdx, overIdx);
        setDragIdx(null);
        setOverIdx(null);
    };

    // Timed mode countdown. Reaching zero counts as a miss.
    const timerRunning = phase === "playing" && timed && !answered;

    useLayoutEffect(() => {
        if (!timerRunning) return;
        const id = setInterval(() => {
            timeLeftRef.current -= 1;
            if (timeLeftRef.current <= 0) {
                timeLeftRef.current = 0;
                clearInterval(id);
                setPicked(-1);
                setTimeLeft(0);
                setStreak(0);
                setLastGain(0);
                setHistory((h) => [...h, { q: question.question, user: "no answer", correct: correctAnswerText(), ok: false, question }]);
            } else {
                setTimeLeft(timeLeftRef.current);
            }
        }, 1000);
        return () => clearInterval(id);
        // The interval only cares about the current question; restarting it on
        // every render would reset the countdown.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- timer uses refs
    }, [timerRunning, index, timeBudget]);

    const nextQuestion = () => {
        if (index + 1 >= deck.length) {
            recordGameResult("popquiz", score);
            setPhase("done");
            return;
        }
        const next = index + 1;
        setIndex(next);
        setPicked(null);
        setFillText("");
        setOrderSteps(deck[next]?.steps ?? []);
        setDrawShapes([]);
        setDrawEdges([]);
        setDragIdx(null);
        setOverIdx(null);
        timeLeftRef.current = timeBudget;
        setTimeLeft(timeBudget);
        setLastGain(0);
    };

    const primaryLabel = () => {
        if (!answered) {
            if (isFill) return "Check answer";
            if (isOrder) return "Check order";
            if (isDraw) return "Check drawing";
            return "Pick an answer";
        }
        return index + 1 >= deck.length ? "See results" : "Next question";
    };

    const primaryAction = () => {
        if (!answered) {
            if (isFill) submitFill();
            else if (isOrder) submitOrder();
            else if (isDraw) submitDraw();
            return;
        }
        nextQuestion();
    };

    // Skip: bail out of the current question without answering. It's recorded
    // as a miss so it still shows up in the review screen.
    const skipQuestion = () => {
        if (answered) return;
        record(false, "skipped");
        grade(false);
        nextQuestion();
    };

    const missed = history.filter((h) => !h.ok);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="popquiz" />
                <h2><Owl />Dev Quiz</h2>
            </div>

            {phase === "setup" && (
                <div className="popquiz-body popquiz-setup">
                    <div className="popquiz-setup-head">
                        <span className="popquiz-badge"><Terminal size={13} /> dev quiz</span>
                        <h3 className="popquiz-prompt">Pick a category</h3>
                        <OwlReadyScene />
                        <p className="popquiz-setup-sub">
                            System design, full stack, coding, web, and language interviews.
                        </p>
                    </div>

                    <div className="popquiz-difficulty">
                        {DIFFICULTIES.map((d) => {
                            const DiffIcon = DIFFICULTY_ICONS[d.id];
                            return (
                                <button
                                    key={d.id}
                                    type="button"
                                    className={`popquiz-diff ${difficulty === d.id ? "active" : ""}`}
                                    onClick={() => setDifficulty(d.id)}
                                >
                                    {DiffIcon && <DiffIcon />}
                                    <b>{d.label}</b>
                                    <small>{d.timer}s</small>
                                </button>
                            );
                        })}
                    </div>

                    <div className="popquiz-length">
                        <span className="popquiz-length-label">Quiz length</span>
                        <div className="popquiz-length-options">
                            {QUIZ_LENGTHS.map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    className={`popquiz-length-btn ${quizLength === n ? "active" : ""}`}
                                    onClick={() => setQuizLength(n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="popquiz-categories">
                        <button
                            type="button"
                            className={`popquiz-category ${category === "all" ? "active" : ""}`}
                            onClick={() => setCategory("all")}
                        >
                            <AllIcon />
                            <span>All topics</span>
                            {bestFor("all", difficulty) > 0 && (
                                <small className="popquiz-cat-best">Best {bestFor("all", difficulty)}</small>
                            )}
                        </button>
                        {QUIZ_CATEGORIES.map((c) => {
                            const CatIcon = CATEGORY_ICONS[c.id];
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`popquiz-category ${category === c.id ? "active" : ""}`}
                                    onClick={() => setCategory(c.id)}
                                >
                                    {CatIcon && <CatIcon />}
                                    <span>{c.label}</span>
                                    {bestFor(c.id, difficulty) > 0 && (
                                        <small className="popquiz-cat-best">Best {bestFor(c.id, difficulty)}</small>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <label className="popquiz-timed">
                        <input
                            type="checkbox"
                            checked={timed}
                            onChange={(e) => setTimed(e.target.checked)}
                        />
                        <span className="popquiz-timed-box">
                            <Clock size={13} />
                        </span>
                        <span className="popquiz-timed-copy">
                            <b>Timed</b>
                            <span>{timeBudget}s per question. Answer faster to score more.</span>
                        </span>
                    </label>

                    <button type="button" className="popquiz-next" onClick={startGame}>
                        <Play size={15} />
                        Start quiz
                    </button>
                </div>
            )}

            {phase === "playing" && question && (
                <div className="popquiz-body">
                    <div className="popquiz-stats">
                        <span>score <b>{score}</b></span>
                        <span>best <b>{bestFor(category, difficulty)}</b></span>
                        <span>streak <b>{streak}</b></span>
                        <button type="button" className="popquiz-restart" onClick={backToSetup}>
                            Change category
                        </button>
                    </div>

                    {timed && (
                        <div className="popquiz-timer">
                            <span className="popquiz-timer-label">
                                <Timer size={13} />
                                {timeLeft}s
                            </span>
                            <span className="popquiz-timer-track">
                                <span
                                    className={`popquiz-timer-bar ${timeLeft <= 5 ? "low" : ""}`}
                                    style={{ width: `${(timeLeft / timeBudget) * 100}%` }}
                                />
                            </span>
                        </div>
                    )}

                    <div className="popquiz-card">
                        <span className="popquiz-badge">
                            <Terminal size={13} /> {categoryLabel} <b className="popquiz-badge-diff">{difficultyDef.label}</b>
                        </span>
                        <h3 className="popquiz-prompt">{question.question}</h3>

                        {isMcq && (
                            <div className="popquiz-options">
                                {question.options.map((option, i) => {
                                    const isAnswer = answered && i === question.answer;
                                    const isPickedWrong = answered && i === picked && i !== question.answer;
                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            className={`popquiz-option ${isAnswer ? "is-correct" : ""} ${isPickedWrong ? "is-wrong" : ""}`}
                                            onClick={() => pick(i)}
                                            disabled={answered}
                                        >
                                            <span className="popquiz-letter">{String.fromCharCode(65 + i)}</span>
                                            <span>{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {isFill && (
                            <div className="popquiz-fill">
                                <input
                                    value={fillText}
                                    onChange={(e) => setFillText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") submitFill();
                                    }}
                                    disabled={answered}
                                    placeholder="Type your answer…"
                                    autoFocus
                                />
                                {question.hint && <span className="popquiz-fill-hint">{question.hint}</span>}
                            </div>
                        )}

                        {isOrder && (
                            <div className="popquiz-order">
                                {question.diagram && (
                                    <ArchDiagram
                                        nodes={question.diagram.nodes}
                                        edges={question.diagram.edges}
                                        compact
                                    />
                                )}
                                <p className="popquiz-order-hint">
                                    Drag the steps into the right order, or use the arrows.
                                </p>
                                <div className="popquiz-order-list">
                                    {orderSteps.map((step, i) => (
                                        <div
                                            key={step}
                                            data-idx={i}
                                            className={`popquiz-order-row ${dragIdx === i ? "is-drag" : ""} ${overIdx === i && dragIdx !== null ? "is-over" : ""}`}
                                            onPointerDown={(e) => onRowPointerDown(e, i)}
                                            onPointerMove={onRowPointerMove}
                                            onPointerUp={onRowPointerUp}
                                            onPointerCancel={onRowPointerUp}
                                        >
                                            <span className="popquiz-grip"><GripVertical size={14} /></span>
                                            <span className="popquiz-order-num">{i + 1}</span>
                                            <span className="popquiz-order-text">{step}</span>
                                            <span className="popquiz-order-arrows">
                                                <button
                                                    type="button"
                                                    onClick={() => moveStep(i, i - 1)}
                                                    disabled={answered || i === 0}
                                                    aria-label="Move up"
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveStep(i, i + 1)}
                                                    disabled={answered || i === orderSteps.length - 1}
                                                    aria-label="Move down"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isDraw && (
                            <DrawCanvas
                                palette={question.palette}
                                shapes={drawShapes}
                                edges={drawEdges}
                                onChangeShapes={setDrawShapes}
                                onToggleEdge={toggleEdge}
                                onRemoveShape={removeDrawShape}
                                onClear={clearDraw}
                                disabled={answered}
                            />
                        )}

                        {answered && (
                            <div className={`popquiz-feedback ${correct ? "is-correct" : "is-wrong"}`}>
                                {feedbackText()}
                            </div>
                        )}
                    </div>

                    <div className="popquiz-actions">
                        {!answered && (
                            <button type="button" className="popquiz-skip" onClick={skipQuestion}>
                                <SkipForward size={15} />
                                Skip
                            </button>
                        )}
                        <button
                            type="button"
                            className="popquiz-next"
                            onClick={primaryAction}
                            disabled={!answered && isMcq}
                        >
                            {primaryLabel()}
                        </button>
                    </div>
                </div>
            )}

            {phase === "done" && (
                <div className="popquiz-body popquiz-results">
                    <OwlVictoryScene />
                    <h3 className="popquiz-prompt">Quiz complete!</h3>
                    <p className="popquiz-results-score">
                        You scored <b>{score}</b> points
                    </p>
                    <p className="popquiz-results-sub">
                        <b className="popquiz-sub-stat">{correctCount}</b> of {deck.length} correct
                        {bestStreak > 1 ? <> <b className="popquiz-sub-stat">{bestStreak} best streak</b></> : ""}
                        {score > runFloor && score > 0 ? <> <b className="popquiz-sub-stat">new personal best!</b></> : ""}
                    </p>
                    <div className="popquiz-results-actions">
                        <button type="button" className="popquiz-next ghost" onClick={backToSetup}>
                            <RotateCcw size={15} />
                            Change category
                        </button>
                        <button type="button" className="popquiz-next" onClick={startGame}>
                            <Play size={15} />
                            Play again
                        </button>
                    </div>

                    {missed.length > 0 && (
                        <div className="popquiz-review">
                            <h4>Review what you missed</h4>
                            {missed.map((m, i) => (
                                <div key={i} className="popquiz-review-item">
                                    <p className="popquiz-review-q">{m.q}</p>
                                    {m.question?.type === "draw" && <ReviewDiagram question={m.question} />}
                                    <p className="popquiz-review-ans">Your answer: {m.user}</p>
                                    <p className="popquiz-review-ans ok">Correct: {m.correct}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

const PopQuizWindow = WindowWrapper(PopQuiz, "popquiz");
export default PopQuizWindow;
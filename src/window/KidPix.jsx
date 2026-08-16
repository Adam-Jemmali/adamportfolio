import { useEffect, useRef, useState } from "react";
import {
    Pencil,
    Paintbrush,
    Rainbow,
    SprayCan,
    Ruler,
    Square,
    Circle,
    PaintBucket,
    Stamp,
    Eraser,
    Undo2,
    Trash2,
    RotateCcw,
    Download,
} from "lucide-react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

const W = 800;
const H = 520;
const STORAGE_KEY = "kidpix-drawing-v1";

const STAMPS = [
    "🧸", "⭐", "❤️", "🌸", "🚀", "🌈",
    "🎨", "🍕", "😀", "🐱", "🎉", "🍀",
];

const TOOLS = [
    { id: "pencil", icon: Pencil, label: "Pencil" },
    { id: "brush", icon: Paintbrush, label: "Brush" },
    { id: "rainbow", icon: Rainbow, label: "Rainbow" },
    { id: "spray", icon: SprayCan, label: "Spray" },
    { id: "line", icon: Ruler, label: "Line" },
    { id: "square", icon: Square, label: "Square" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "fill", icon: PaintBucket, label: "Fill" },
    { id: "stamp", icon: Stamp, label: "Stamp" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
];

const COLORS = [
    "#000000", "#444444", "#9aa0aa", "#ffffff",
    "#e53935", "#fb8c00", "#fdd835", "#aeea00",
    "#43a047", "#00bcd4", "#1e88e5", "#5e35b1",
    "#d81b60", "#6d4c41", "#f8bbd0", "#009688",
];

const SIZES = [
    { id: "s", label: "Small", width: 3, dot: 6 },
    { id: "m", label: "Medium", width: 8, dot: 12 },
    { id: "l", label: "Large", width: 16, dot: 22 },
];

const hexToRgb = (hex) => {
    const m = hex.replace("#", "");
    return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
};

const drawWelcomeCanvas = (canvas) => {
    const g = canvas.getContext("2d", { willReadFrequently: true });
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = "source-over";
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, W, H);

    const cx = W / 2;
    g.textAlign = "center";
    g.textBaseline = "middle";

    const word1 = "Talk is cheap,";
    g.font = "800 62px Georama, -apple-system, 'Segoe UI', sans-serif";
    const w1 = g.measureText(word1).width;
    const grad1 = g.createLinearGradient(cx - w1 / 2, 0, cx + w1 / 2, 0);
    grad1.addColorStop(0, "#4ad8ed");
    grad1.addColorStop(0.5, "#3aa7ce");
    grad1.addColorStop(1, "#1e88e5");
    g.fillStyle = grad1;
    g.fillText(word1, cx, H / 2 - 42);

    const word2 = "show me the code";
    g.font = "800 44px Georama, -apple-system, 'Segoe UI', sans-serif";
    const w2 = g.measureText(word2).width;
    const grad2 = g.createLinearGradient(cx - w2 / 2, 0, cx + w2 / 2, 0);
    grad2.addColorStop(0, "#1e88e5");
    grad2.addColorStop(0.5, "#5e35b1");
    grad2.addColorStop(1, "#7c3aed");
    g.fillStyle = grad2;
    g.fillText(word2, cx, H / 2 + 24);

    g.font = "500 16px Georama, -apple-system, 'Segoe UI', sans-serif";
    g.fillStyle = "#c2c7cf";
    g.fillText("✏️ erase me — then draw your own!", cx, H - 42);
};

const floodFill = (g, w, h, sx, sy, fillHex) => {
    const [fr, fg, fb] = hexToRgb(fillHex);
    const img = g.getImageData(0, 0, w, h);
    const data = img.data;
    const idx = ((sy | 0) * w + (sx | 0)) * 4;
    const tr = data[idx];
    const tg = data[idx + 1];
    const tb = data[idx + 2];
    const ta = data[idx + 3];
    if (fr === tr && fg === tg && fb === tb) return;

    const match = (i) => data[i] === tr && data[i + 1] === tg && data[i + 2] === tb && data[i + 3] === ta;
    const stack = [[sx | 0, sy | 0]];
    while (stack.length) {
        const [x, y] = stack.pop();
        const i0 = (y * w + x) * 4;
        if (!match(i0)) continue;

        let lx = x;
        while (lx > 0 && match((y * w + lx - 1) * 4)) lx--;
        let rx = x;
        while (rx < w - 1 && match((y * w + rx + 1) * 4)) rx++;

        for (let kx = lx; kx <= rx; kx++) {
            const ki = (y * w + kx) * 4;
            data[ki] = fr;
            data[ki + 1] = fg;
            data[ki + 2] = fb;
            data[ki + 3] = 255;
        }
        if (y > 0) for (let kx = lx; kx <= rx; kx++) if (match((y - 1) * w * 4 + kx * 4)) stack.push([kx, y - 1]);
        if (y < h - 1) for (let kx = lx; kx <= rx; kx++) if (match((y + 1) * w * 4 + kx * 4)) stack.push([kx, y + 1]);
    }
    g.putImageData(img, 0, 0);
};

const KidPix = () => {
    const canvasRef = useRef(null);
    const drawingRef = useRef(null);
    const historyRef = useRef([]);
    const hueRef = useRef(0);

    const [tool, setTool] = useState("pencil");
    const [color, setColor] = useState("#000000");
    const [size, setSize] = useState("m");
    const [stamp, setStamp] = useState(STAMPS[0]);
    const sizeDef = SIZES.find((s) => s.id === size) || SIZES[1];

    const saveTimerRef = useRef(null);

    const persistDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        try {
            localStorage.setItem(STORAGE_KEY, canvas.toDataURL("image/png"));
        } catch {
            /* storage may be unavailable; drawing still works in memory */
        }
    };

    const scheduleSave = () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(persistDrawing, 250);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        let saved = null;
        try {
            saved = localStorage.getItem(STORAGE_KEY);
        } catch {
            /* ignore storage errors */
        }

        if (!saved) {
            drawWelcomeCanvas(canvas);
            return;
        }

        const g = canvas.getContext("2d", { willReadFrequently: true });
        const img = new Image();
        img.onload = () => {
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.clearRect(0, 0, W, H);
            g.drawImage(img, 0, 0);
        };
        img.onerror = () => drawWelcomeCanvas(canvas);
        img.src = saved;

        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    const toolWidth = (t) => {
        switch (t) {
            case "pencil":
                return sizeDef.width;
            case "brush":
                return sizeDef.width * 2;
            case "rainbow":
                return sizeDef.width * 1.6;
            case "eraser":
                return Math.max(sizeDef.width * 2.5, 22);
            default:
                return sizeDef.width;
        }
    };

    const rainbowColor = () => {
        hueRef.current = (hueRef.current + 26) % 360;
        return `hsl(${hueRef.current} 90% 55%)`;
    };

    const pushHistory = () => {
        historyRef.current.push(canvasRef.current.toDataURL());
        if (historyRef.current.length > 40) historyRef.current.shift();
    };

    const posFromEvent = (e) => {
        const r = canvasRef.current.getBoundingClientRect();
        return {
            x: ((e.clientX - r.left) / r.width) * W,
            y: ((e.clientY - r.top) / r.height) * H,
        };
    };

    const drawShape = (g, t, x1, y1, x2, y2, c, w) => {
        g.save();
        g.strokeStyle = c;
        g.lineWidth = w;
        g.lineCap = "round";
        if (t === "line") {
            g.beginPath();
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
            g.stroke();
        } else if (t === "square") {
            g.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
        } else if (t === "circle") {
            const r = Math.hypot(x2 - x1, y2 - y1);
            g.beginPath();
            g.arc(x1, y1, r, 0, Math.PI * 2);
            g.stroke();
        }
        g.restore();
    };

    const spray = (g, x, y, c, radius) => {
        g.fillStyle = c;
        for (let i = 0; i < 26; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
            g.beginPath();
            g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.3, 0, Math.PI * 2);
            g.fill();
        }
    };

    const drawStamp = (g, x, y, emoji) => {
        g.save();
        g.font = "46px serif";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(emoji, x, y);
        g.restore();
    };

    const onPointerDown = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const c = canvasRef.current;
        const g = c.getContext("2d", { willReadFrequently: true });
        e.preventDefault();
        try {
            c.setPointerCapture?.(e.pointerId);
        } catch {
            /* synthetic or unsupported pointer */
        }
        const p = posFromEvent(e);

        if (tool === "fill") {
            pushHistory();
            floodFill(g, W, H, Math.round(p.x), Math.round(p.y), color);
            scheduleSave();
            return;
        }
        if (tool === "stamp") {
            pushHistory();
            drawStamp(g, p.x, p.y, stamp);
            scheduleSave();
            return;
        }

        pushHistory();
        drawingRef.current = {
            tool,
            sx: p.x,
            sy: p.y,
            lx: p.x,
            ly: p.y,
            snapshot: g.getImageData(0, 0, W, H),
        };

        if (["pencil", "brush", "rainbow", "spray", "eraser"].includes(tool)) {
            g.save();
            g.lineCap = "round";
            g.lineJoin = "round";
            if (tool === "eraser") {
                g.strokeStyle = "#ffffff";
                g.lineWidth = toolWidth(tool);
            } else {
                g.strokeStyle = tool === "rainbow" ? rainbowColor() : color;
                g.lineWidth = toolWidth(tool);
            }
            g.beginPath();
            g.moveTo(p.x, p.y);
            g.lineTo(p.x + 0.01, p.y + 0.01);
            g.stroke();
            g.restore();
        }
    };

    const onPointerMove = (e) => {
        const d = drawingRef.current;
        if (!d) return;
        const g = canvasRef.current.getContext("2d", { willReadFrequently: true });
        const p = posFromEvent(e);

        if (["pencil", "brush", "rainbow", "spray", "eraser"].includes(d.tool)) {
            g.save();
            g.lineCap = "round";
            g.lineJoin = "round";
            if (d.tool === "spray") {
                spray(g, p.x, p.y, color, Math.max(toolWidth(d.tool) * 2, 26));
            } else {
                if (d.tool === "eraser") {
                    g.strokeStyle = "#ffffff";
                    g.lineWidth = toolWidth(d.tool);
                } else {
                    g.strokeStyle = d.tool === "rainbow" ? rainbowColor() : color;
                    g.lineWidth = toolWidth(d.tool);
                }
                g.beginPath();
                g.moveTo(d.lx, d.ly);
                g.lineTo(p.x, p.y);
                g.stroke();
            }
            g.restore();
        } else {
            g.putImageData(d.snapshot, 0, 0);
            drawShape(g, d.tool, d.sx, d.sy, p.x, p.y, color, sizeDef.width);
        }
        d.lx = p.x;
        d.ly = p.y;
    };

    const onPointerUp = () => {
        const d = drawingRef.current;
        if (!d) return;
        // A click with no drag should still place a small shape.
        if (!["pencil", "brush", "rainbow", "spray", "eraser"].includes(d.tool) && d.lx === d.sx && d.ly === d.sy) {
            const g = canvasRef.current.getContext("2d", { willReadFrequently: true });
            g.putImageData(d.snapshot, 0, 0);
            const off = d.tool === "line" ? 1 : 22;
            drawShape(g, d.tool, d.sx, d.sy, d.sx + off, d.sy + off, color, sizeDef.width);
        }
        drawingRef.current = null;
        scheduleSave();
    };

    const undo = () => {
        const prev = historyRef.current.pop();
        if (prev == null) return;
        const img = new Image();
        img.onload = () => {
            const g = canvasRef.current?.getContext("2d", { willReadFrequently: true });
            if (!g) return;
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.clearRect(0, 0, W, H);
            g.drawImage(img, 0, 0);
            persistDrawing();
        };
        img.src = prev;
    };

    const clear = () => {
        pushHistory();
        const g = canvasRef.current.getContext("2d", { willReadFrequently: true });
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, W, H);
        scheduleSave();
    };

    const reset = () => {
        pushHistory();
        drawWelcomeCanvas(canvasRef.current);
        scheduleSave();
    };

    const save = () => {
        const link = document.createElement("a");
        link.download = "kidpix-drawing.png";
        link.href = canvasRef.current.toDataURL("image/png");
        link.click();
    };

    return (
        <>
            <div id="window-header">
                <WindowsControls target="kidpix" />
                <h2>Kid Pix</h2>
            </div>

            <div className="kidpix-body">
                <div className="kidpix-canvas-wrap">
                    <canvas
                        ref={canvasRef}
                        width={W}
                        height={H}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                    />
                </div>

                <div className="kidpix-toolbar">
                    <div className="kidpix-row">
                        {TOOLS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className={`kidpix-tool${tool === t.id ? " active" : ""}`}
                                onClick={() => setTool(t.id)}
                                title={t.label}
                                aria-label={t.label}
                            >
                                <t.icon size={18} />
                            </button>
                        ))}
                    </div>

                    {tool === "stamp" && (
                        <div className="kidpix-row" role="group" aria-label="Stickers">
                            {STAMPS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`kidpix-stamp${stamp === s ? " active" : ""}`}
                                    onClick={() => setStamp(s)}
                                    title={`Stamp ${s}`}
                                    aria-label={`Stamp ${s}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="kidpix-row">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                className={`kidpix-swatch${color === c ? " active" : ""}`}
                                style={{ background: c }}
                                onClick={() => setColor(c)}
                                aria-label={c}
                            />
                        ))}
                    </div>

                    <div className="kidpix-row">
                        {SIZES.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`kidpix-size${size === s.id ? " active" : ""}`}
                                onClick={() => setSize(s.id)}
                                title={s.label}
                                aria-label={s.label}
                            >
                                <span className="kidpix-size-dot" style={{ width: s.dot, height: s.dot }} />
                            </button>
                        ))}

                        <span className="kidpix-spacer" />

                        <button type="button" className="kidpix-action" onClick={undo} title="Undo">
                            <Undo2 size={16} />
                            Undo
                        </button>
                        <button type="button" className="kidpix-action" onClick={clear} title="Clear">
                            <Trash2 size={16} />
                            Clear
                        </button>
                        <button type="button" className="kidpix-action" onClick={reset} title="Reset">
                            <RotateCcw size={16} />
                            Reset
                        </button>
                        <button type="button" className="kidpix-action" onClick={save} title="Save">
                            <Download size={16} />
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const KidPixWindow = WindowWrapper(KidPix, "kidpix");
export default KidPixWindow;

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { parse as parseBuffer } from "opentype.js";

/* ── CONSTANTS ────────────────────────────────────────────────────── */
const FONT_URL = "/fonts/Lobster-Regular.ttf";
const WORD = "madaj builds";
const SCALE = 0.002; // 5439 × 0.002 = 10.88 world units — fills edge-to-edge with cam z=14
const TRACKING = 1.0; // tight cursive flow, letters overlap naturally

// Per-letter minimum gap — keep tight so cursive connects
const MIN_GAP = -15;
// Per-letter overrides — only give space where visually needed
const GAP_OVERRIDES = {
    j: 10,
    b: 5,
};

// Theme-reactive colors
const CURSOR_COLOR = "#3fa9f5";

// Colors per theme
const THEMES_COLORS = {
    A: { letter: "#7fc4ff", emissive: "#1e8fd8", rim: "#0f5f9e", cursor: "#3fa9f5", accent: [0.31, 0.61, 1.0] },
    B: { letter: "#ffd9a3", emissive: "#d4882b", rim: "#8b5e2b", cursor: "#e8a44a", accent: [0.95, 0.78, 0.45] },
    C: { letter: "#ffb3b3", emissive: "#d45555", rim: "#8b3030", cursor: "#e86060", accent: [0.95, 0.5, 0.5] },
};

// Glitch sticker colors
const STICKER_COLORS = ["#4ade80", "#facc15", "#f87171", "#22d3ee", "#a78bfa", "#fb923c", "#f472b6", "#34d399"];

/* ── FONT LOADING ─────────────────────────────────────────────────── */
let cachedFont = null;
let fontPromise = null;

async function loadFont() {
    if (cachedFont) return cachedFont;
    if (fontPromise) return fontPromise;
    fontPromise = (async () => {
        try {
            const resp = await fetch(FONT_URL);
            const buf = await resp.arrayBuffer();
            cachedFont = parseBuffer(buf);
            return cachedFont;
        } catch (err) {
            console.error("Font load failed:", err);
            return null;
        }
    })();
    return fontPromise;
}

/* ── GLYPH EXTRACTION ─────────────────────────────────────────────── */

/**
 * Convert an opentype path to THREE.Shape array (one Shape per contour).
 */
function pathToShapes(path) {
    const shapes = [];
    let current = null;

    for (const cmd of path.commands) {
        if (cmd.type === "M") {
            if (current) shapes.push(current);
            current = new THREE.Shape();
            current.moveTo(cmd.x, -cmd.y);
        } else if (cmd.type === "L") {
            current.lineTo(cmd.x, -cmd.y);
        } else if (cmd.type === "Q") {
            current.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y);
        } else if (cmd.type === "C") {
            current.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y);
        } else if (cmd.type === "Z" || cmd.type === "z") {
            // closePath is implicit in Shape
        }
    }
    if (current) shapes.push(current);

    return shapes;
}

/**
 * Extract per-letter layout data: advance width, glyph shapes, and
 * the gap-adjusted x position.
 */
function computeLayout(font, word) {
    if (!font) return [];

    const letters = [];
    let cursorX = 0;

    for (let i = 0; i < word.length; i++) {
        const ch = word[i];

        if (ch === " ") {
            // Space: advance by a fixed width (600 font units)
            const spaceAdvance = 600;
            letters.push({ ch, x: cursorX, advance: spaceAdvance, shapes: [] });
            cursorX += spaceAdvance;
            continue;
        }

        const glyph = font.charToGlyph(ch);
        const advance = glyph.advanceWidth || 500;
        const path = glyph.getPath(0, 0, font.unitsPerEm);
        const shapes = pathToShapes(path);

        // Compute the next letter's index for gap check
        const nextCh = word[i + 1];
        let gap = MIN_GAP;
        if (nextCh && GAP_OVERRIDES[ch]) gap = GAP_OVERRIDES[ch];

        letters.push({ ch, x: cursorX, advance: advance + gap, shapes, rawAdvance: advance });

        cursorX += advance + gap;
    }

    // Center the layout around origin
    const totalWidth = cursorX;
    for (const l of letters) {
        l.x -= totalWidth / 2;
    }

    // Center and return — letters are now in correct LTR order with proper Y-up orientation
    return letters;
}
/**
 * Compute each letter's on-screen rect from the deterministic layout and the
 * camera setup, independent of the WebGL render loop. Used so falling icons
 * can fade as they pass behind the wordmark even when the render loop stalls.
 */
function computeWordmarkRects(letters, canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) return [];

    const cam = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    cam.position.set(0, 2.5, 14);
    cam.lookAt(0, 0, 0);
    cam.updateMatrixWorld(true);

    const v = new THREE.Vector3();
    const rects = [];

    for (const letter of letters) {
        if (!letter.shapes || letter.shapes.length === 0) continue;

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        for (const shape of letter.shapes) {
            const pts = shape.getPoints(20);
            for (const p of pts) {
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            }
        }
        if (!isFinite(minX)) continue;

        const x0 = (letter.x + minX) * SCALE;
        const x1 = (letter.x + maxX) * SCALE;
        const y0 = minY * SCALE;
        const y1 = maxY * SCALE;

        let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
        for (const [cx, cy] of [[x0, y0], [x0, y1], [x1, y0], [x1, y1]]) {
            v.set(cx, cy, 0).project(cam);
            const px = rect.left + (v.x * 0.5 + 0.5) * w;
            const py = rect.top + (1 - (v.y * 0.5 + 0.5)) * h;
            if (px < left) left = px;
            if (px > right) right = px;
            if (py < top) top = py;
            if (py > bottom) bottom = py;
        }
        rects.push({ left, right, top, bottom });
    }
    return rects;
}

/* ── 3D COMPONENTS ────────────────────────────────────────────────── */

/**
 * A single extruded 3D letter with glossy puffy material.
 * Deep extrusion + smooth bevel for the chunky bubble look.
 */
function Letter3D({ shapes, position, themeKey = "A" }) {
    const groupRef = useRef(null);
    const meshRef = useRef(null);
    const colors = THEMES_COLORS[themeKey] || THEMES_COLORS.A;

    // Build geometry from shapes — first shape is outer contour, rest are holes
    const geometry = useMemo(() => {
        if (!shapes || shapes.length === 0) return null;

        const extrudeSettings = {
            depth: 280,
            bevelEnabled: true,
            bevelThickness: 45,
            bevelSize: 20,
            bevelSegments: 8,
        };

        if (shapes.length === 1) {
            return new THREE.ExtrudeGeometry(shapes[0], extrudeSettings);
        }

        // Use the first shape (outer contour) as the main shape,
        // and add remaining contours as holes for proper counter rendering
        const mainShape = shapes[0];
        for (let i = 1; i < shapes.length; i++) {
            mainShape.holes.push(new THREE.Path(shapes[i].getPoints()));
        }
        return new THREE.ExtrudeGeometry(mainShape, extrudeSettings);
    }, [shapes]);

    if (!geometry) return null;

    return (
        <group ref={groupRef} position={position}>
            <mesh ref={meshRef} geometry={geometry} scale={[SCALE, SCALE, SCALE]} frustumCulled={false}>
                <meshPhysicalMaterial
                    
                    side={THREE.DoubleSide}
                    color={colors.letter}
                    emissive={colors.emissive}
                    emissiveIntensity={0.25}
                    roughness={0.08}
                    metalness={0.0}
                    clearcoat={1}
                    clearcoatRoughness={0.03}
                    envMapIntensity={2.0}
                />
            </mesh>
        </group>
    );
}

/**
 * The complete "madaj builds" wordmark as a group of 3D letters.
 */
function ScriptWord({ layoutData, scrollProgress, themeKey = "A" }) {
    const groupRef = useRef(null);
    const letterRefs = useRef([]);
    const letterTargets = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const onMove = (e) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -(e.clientY / window.innerHeight) * 2 + 1;
            mouseRef.current = { x: nx, y: ny };
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    useFrame((state, delta) => {
        const g = groupRef.current;
        if (!g) return;

        // Smooth mouse parallax + scroll tilt
        const sp = scrollProgress;
        const mx = mouseRef.current.x * 0.15;
        const my = mouseRef.current.y * 0.08;
        const tiltX = my + sp * 1.2;
        const groupEase = 1 - Math.pow(0.02, delta);
        g.rotation.y += (mx - g.rotation.y) * groupEase;
        g.rotation.x += (tiltX - g.rotation.x) * groupEase;
        g.position.z = -sp * 5;
        g.scale.setScalar(1 - sp * 0.35);

        // Per-letter gravity animation
        const mouseNDC = mouseRef.current;
        const aspect = window.innerWidth / window.innerHeight;
        const vFov = (42 * Math.PI) / 180;
        const worldHeight = 2 * Math.tan(vFov / 2) * 14;
        const worldWidth = worldHeight * aspect;
        const mouseWorldX = mouseNDC.x * worldWidth / 2;
        const mouseWorldY = mouseNDC.y * worldHeight / 2;
        const t = state.clock.elapsedTime;

        letterRefs.current.forEach((ref, i) => {
            if (!ref) return;
            const letter = layoutData[i];
            if (!letter || letter.shapes.length === 0) return;

            const letterWorldX = letter.x * SCALE;
            const dx = mouseWorldX - letterWorldX;
            const dy = mouseWorldY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Gravity pull effect: letters lift toward the mouse with spring
            const radius = 2.5;
            const strength = Math.max(0, 1 - dist / radius);
            const ease = strength * strength * (3 - 2 * strength); // smoothstep

            const targetY = ease * 0.6;
            const targetRotZ = ease * dx * -0.15;
            // Gentle breathing pulse when the cursor is idle/away (ease ≈ 0)
            const breathe = (1 - ease) * Math.sin(t * 0.9 + i * 0.55) * 0.035;
            const targetScale = 1 + ease * 0.12 + breathe;

            // Store targets for spring interpolation
            if (!letterTargets.current[i]) {
                letterTargets.current[i] = { y: 0, rotZ: 0, scale: 1 };
            }
            const target = letterTargets.current[i];
            target.y = targetY;
            target.rotZ = targetRotZ;
            target.scale = targetScale;

            // Gentle spring lerp toward target (slow & smooth)
            const spring = 1 - Math.pow(0.05, delta);
            ref.position.y += (target.y - ref.position.y) * spring;
            ref.rotation.z += (target.rotZ - ref.rotation.z) * spring;
            const currentScale = ref.scale.x;
            const newScale = currentScale + (target.scale - currentScale) * spring;
            ref.scale.setScalar(newScale);
        });
    });

    return (
        <group ref={groupRef}>
            {layoutData.map((letter, i) => {
                if (letter.shapes.length === 0) return null;
                const worldX = letter.x * SCALE;
                return (
                    <group
                        key={`${letter.ch}-${i}`}
                        ref={(el) => { letterRefs.current[i] = el; }}
                        position={[worldX, 0, 0]}
                    >
                        <Letter3D
                            shapes={letter.shapes}
                            position={[0, 0, 0]}
                            themeKey={themeKey}
                        />
                    </group>
                );
            })}
        </group>
    );
}

/**
 * 3D cursor arrow that glides letter-to-letter.
 */
function Cursor3D({ layoutData, themeKey = "A" }) {
    const ref = useRef(null);
    const colors = THEMES_COLORS[themeKey] || THEMES_COLORS.A;

    // Build the cursor shape (classic arrow pointer)
    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, -0.6);
        shape.lineTo(0.18, -0.45);
        shape.lineTo(0.45, -0.7);
        shape.lineTo(0.6, -0.55);
        shape.lineTo(0.35, -0.28);
        shape.lineTo(0.55, -0.22);
        shape.lineTo(0, 0);

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.15,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            bevelSegments: 2,
        });
    }, []);

    useFrame((state) => {
        const g = ref.current;
        if (!g || layoutData.length === 0) return;

        const t = state.clock.elapsedTime;
        // Each letter gets ~0.8s, total cycle = letters * 0.8
        const cycleDuration = layoutData.length * 0.8;
        const cyclePos = (t % cycleDuration) / cycleDuration;
        const letterFloat = cyclePos * layoutData.length;
        const letterIdx = Math.floor(letterFloat);
        const letterFrac = letterFloat - letterIdx;

        const safeIdx = Math.min(letterIdx, layoutData.length - 1);
        const nextIdx = Math.min(safeIdx + 1, layoutData.length - 1);

        const x1 = layoutData[safeIdx].x * SCALE;
        const x2 = layoutData[nextIdx].x * SCALE;

        // Smooth interpolation
        const smoothFrac = letterFrac * letterFrac * (3 - 2 * letterFrac);
        const targetX = x1 + (x2 - x1) * smoothFrac;
        const bob = Math.sin(t * 4) * 0.05;

        g.position.set(targetX, -0.9 + bob, 1.2);
    });

    return (
        <mesh ref={ref} geometry={geometry} scale={0.42} frustumCulled={false}>
            <meshPhysicalMaterial
                color={colors.cursor}
                emissive={colors.cursor}
                emissiveIntensity={0.3}
                roughness={0.15}
                metalness={0.1}
                clearcoat={1}
            />
        </mesh>
    );
}

/**
 * Fading trail behind the cursor.
 */
function CursorTrail({ layoutData, themeKey = "A" }) {
    const ref = useRef();
    const colors = THEMES_COLORS[themeKey] || THEMES_COLORS.A;

    const geometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, -0.6);
        shape.lineTo(0.18, -0.45);
        shape.lineTo(0.45, -0.7);
        shape.lineTo(0.6, -0.55);
        shape.lineTo(0.35, -0.28);
        shape.lineTo(0.55, -0.22);
        shape.lineTo(0, 0);

        return new THREE.ExtrudeGeometry(shape, {
            depth: 0.1,
            bevelEnabled: false,
        });
    }, []);

    useFrame((state) => {
        const g = ref.current;
        if (!g || layoutData.length === 0) return;

        const t = state.clock.elapsedTime;
        const cycleDuration = layoutData.length * 0.8;
        const cyclePos = (t % cycleDuration) / cycleDuration;
        const letterFloat = cyclePos * layoutData.length;
        const safeIdx = Math.min(Math.floor(letterFloat), layoutData.length - 1);

        // Trail is one letter behind
        const trailIdx = Math.max(0, safeIdx - 1);
        const trailX = layoutData[trailIdx].x * SCALE;

        g.position.set(trailX, -0.9, 1.0);
        g.material.opacity = 0.25;
    });

    return (
        <mesh ref={ref} geometry={geometry} scale={0.36} frustumCulled={false}>
            <meshPhysicalMaterial
                color={colors.cursor}
                emissive={colors.cursor}
                emissiveIntensity={0.2}
                transparent
                opacity={0.25}
                roughness={0.2}
            />
        </mesh>
    );
}

/**
 * Colored glitch stickers on the letters.
 */
function GlitchStickers({ layoutData }) {
    const groupRef = useRef();

    const stickers = useMemo(() => {
        return layoutData
            .filter((l) => l.shapes.length > 0)
            .map((l, i) => ({
                x: l.x * SCALE,
                y: (((i * 17 + 7) % 30) / 100) - 0.15,
                z: 0.5 + (((i * 13 + 3) % 30) / 100),
                color: STICKER_COLORS[i % STICKER_COLORS.length],
                size: 0.06 + (((i * 11 + 5) % 8) / 100),
                speed: 1 + (((i * 7 + 2) % 20) / 10),
                phase: ((i * 31) % 63) / 10,
            }));
    }, [layoutData]);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        const children = groupRef.current.children;
        for (let i = 0; i < children.length; i++) {
            const s = stickers[i];
            if (!s) continue;
            children[i].scale.setScalar(
                s.size * (1 + Math.sin(t * s.speed + s.phase) * 0.3)
            );
            children[i].material.opacity =
                0.5 + Math.sin(t * s.speed * 0.7 + s.phase) * 0.3;
        }
    });

    return (
        <group ref={groupRef}>
            {stickers.map((s, i) => (
                <mesh key={i} position={[s.x, s.y, s.z]} frustumCulled={false}>
                    <boxGeometry args={[1, 1, 0.05]} />
                    <meshPhysicalMaterial
                        color={s.color}
                        emissive={s.color}
                        emissiveIntensity={0.4}
                        transparent
                        opacity={0.5}
                        roughness={0.3}
                    />
                </mesh>
            ))}
        </group>
    );
}

/**
 * Shimmer sweep — a tight spot light that glides left → right once on load.
 */
function ShimmerSweep() {
    const lightRef = useRef();

    useFrame((state) => {
        const l = lightRef.current;
        if (!l) return;
        const t = state.clock.elapsedTime;
        const start = 0.6;
        const duration = 1.4;
        const elapsed = t - start;

        if (elapsed < 0 || elapsed > duration) {
            l.intensity = 0;
            return;
        }

        const progress = elapsed / duration;
        const x = -5 + progress * 10; // sweep from -5 to +5
        l.position.set(x, 1, 3);
        l.intensity = 27 * Math.sin(progress * Math.PI);
    });

    return (
        <spotLight
            ref={lightRef}
            color="#ffffff"
            distance={12}
            angle={0.3}
            penumbra={0.8}
            intensity={0}
        />
    );
}

/* ── MAIN CANVAS ──────────────────────────────────────────────────── */

function Scene({ layoutData, scrollProgress, themeKey }) {
    return (
        <>
            <ambientLight intensity={0.35} />
            <directionalLight position={[3, 5, 6]} intensity={2.5} />
            <directionalLight position={[-6, 3, 5]} intensity={1.8} color="#8ec5ff" />
            <pointLight position={[0, -4, 6]} intensity={1.5} color="#6ab0ff" />
            <pointLight position={[6, 2, 3]} intensity={0.8} color="#ffffff" />
            <Suspense fallback={null}>
                <ScriptWord layoutData={layoutData} scrollProgress={scrollProgress} themeKey={themeKey} />
                <Cursor3D layoutData={layoutData} themeKey={themeKey} />
                <CursorTrail layoutData={layoutData} themeKey={themeKey} />
                <GlitchStickers layoutData={layoutData} />
                <ShimmerSweep />
                <Environment preset="city" />
            </Suspense>
        </>
    );
}

/* ── MAIN COMPONENT ───────────────────────────────────────────────── */

export default function Hero3D({ scrollProgress = 0, themeKey = "A", wordmarkRectRef = null }) {
    const [layoutData, setLayoutData] = useState(null);
    const stateRef = useRef(null);
    const startRef = useRef(0);

    useEffect(() => {
        loadFont().then((font) => {
            if (font) {
                setLayoutData(computeLayout(font, WORD));
            }
        });
    }, []);

    // Expose per-letter viewport rects (computed from layout + camera, not the
    // render loop) so falling icons can fade behind the glyphs even when the
    // WebGL render loop is throttled or stalled.
    useEffect(() => {
        if (!layoutData || !wordmarkRectRef) return;
        const tick = () => {
            const canvas = document.querySelector(".hero-canvas-wrap canvas");
            if (canvas) {
                wordmarkRectRef.current = computeWordmarkRects(layoutData, canvas);
            }
        };
        tick();
        const id = setInterval(tick, 16);
        return () => clearInterval(id);
    }, [layoutData, wordmarkRectRef]);

    // Drive the render loop on a wall-clock timer so the scene keeps
    // animating even when the Preview tab throttles requestAnimationFrame.
    useEffect(() => {
        const interval = setInterval(() => {
            const state = stateRef.current;
            if (state && startRef.current) {
                state.advance((performance.now() - startRef.current) / 1000);
            }
        }, 16);
        return () => clearInterval(interval);
    }, []);

    if (!layoutData) return <div className="hero-canvas" style={{ width: "100%", height: "400px" }} />;

    return (
        <Canvas
            className="hero-canvas"
            dpr={[1, 2]}
            frameloop="never"
            camera={{ position: [0, 2.5, 14], fov: 42 }}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
            onCreated={(state) => {
                stateRef.current = state;
                startRef.current = performance.now();
            }}
            style={{ width: "100%", height: "100%" }}
        >
            <Scene layoutData={layoutData} scrollProgress={scrollProgress} themeKey={themeKey} />
        </Canvas>
    );
}

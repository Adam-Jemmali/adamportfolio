import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── CONSTANTS ────────────────────────────────────────────────────── */
const FONT_URL = "/fonts/Lobster-Regular.ttf";
const WORD = "madaj builds";
export const SCALE = 0.002; // 5439 × 0.002 = 10.88 world units — fills edge-to-edge with cam z=14
const HERO_WORD_SCALE = 1.28; // extra chunk applied to the whole wordmark group
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
export const THEMES_COLORS = {
    A: { letter: "#7fc4ff", emissive: "#1e8fd8", rim: "#0f5f9e", cursor: "#3fa9f5", accent: [0.31, 0.61, 1.0] },
    B: { letter: "#ffd9a3", emissive: "#d4882b", rim: "#8b5e2b", cursor: "#e8a44a", accent: [0.95, 0.78, 0.45] },
    C: { letter: "#ffb3b3", emissive: "#d45555", rim: "#8b3030", cursor: "#e86060", accent: [0.95, 0.5, 0.5] },
    // Vivid orange — pops against a light-grey surface (used by the OS toast)
    TOAST: { letter: "#ff7a2f", emissive: "#c73f0a", rim: "#7a2606", cursor: "#ff7a2f", accent: [1.0, 0.48, 0.18] },
};

// Glitch sticker colors
const STICKER_COLORS = ["#4ade80", "#facc15", "#f87171", "#22d3ee", "#a78bfa", "#fb923c", "#f472b6", "#34d399"];

/* ── FONT LOADING ─────────────────────────────────────────────────── */
let cachedFont = null;
let fontPromise = null;

export async function loadFont() {
    if (cachedFont) return cachedFont;
    if (fontPromise) return fontPromise;
    fontPromise = (async () => {
        try {
            // opentype.js is heavy — load it lazily so it stays out of the
            // initial bundle and never blocks first paint.
            const [{ parse: parseBuffer }, buf] = await Promise.all([
                import("opentype.js"),
                fetch(FONT_URL).then((r) => r.arrayBuffer()),
            ]);
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
 * Convert an opentype glyph path to an array of FULLY-FILLED solid
 * THREE.Shape objects — no holes at all.
 *
 * Every letter comes out as a chunky filled blob: the bowls/counters of
 * a / b / d / e / g / o / s are filled in, and disjoint parts like the
 * tittle of an "i" / "j" stay as their own filled solids. Counters are
 * detected by winding direction (opposite to the outline) and dropped.
 */
function pathToShapes(path) {
    // One THREE.Path per contour (curves preserved).
    const contours = [];
    let cur = null;
    for (const cmd of path.commands) {
        if (cmd.type === "M") {
            if (cur) contours.push(cur);
            cur = new THREE.Path();
            cur.moveTo(cmd.x, -cmd.y);
        } else if (cmd.type === "L") {
            cur.lineTo(cmd.x, -cmd.y);
        } else if (cmd.type === "Q") {
            cur.quadraticCurveTo(cmd.x1, -cmd.y1, cmd.x, -cmd.y);
        } else if (cmd.type === "C") {
            cur.bezierCurveTo(cmd.x1, -cmd.y1, cmd.x2, -cmd.y2, cmd.x, -cmd.y);
        }
    }
    if (cur) contours.push(cur);
    if (contours.length === 0) return [];

    const polys = contours.map((c) => c.getPoints(64));
    if (polys.length === 1) return [new THREE.Shape(polys[0])];

    // In a font glyph, solid outlines wind one way and their counters
    // wind the opposite way (that's how non-zero fill cuts the holes).
    // Keep only contours that wind the same way as the biggest contour —
    // every counter is dropped, so the letter fills in solid. Disjoint
    // solids (the "i"/"j" tittle) share the outer winding, so they stay.
    const signedArea = (poly) => {
        let a = 0;
        for (let i = 0; i < poly.length; i++) {
            const j = (i + 1) % poly.length;
            a += poly[i].x * poly[j].y - poly[j].x * poly[i].y;
        }
        return a / 2;
    };
    const areas = polys.map(signedArea);
    let biggest = 0;
    for (let i = 1; i < areas.length; i++) {
        if (Math.abs(areas[i]) > Math.abs(areas[biggest])) biggest = i;
    }
    const solidSign = Math.sign(areas[biggest]) || 1;

    const shapes = polys
        .filter((_, i) => Math.sign(areas[i]) === solidSign && Math.abs(areas[i]) > 1)
        .map((poly) => new THREE.Shape(poly));

    return shapes.length ? shapes : [new THREE.Shape(polys[biggest])];
}

/**
 * Extract per-letter layout data: advance width, glyph shapes, and
 * the gap-adjusted x position.
 */
export function computeLayout(font, word) {
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

        const x0 = (letter.x + minX) * SCALE * HERO_WORD_SCALE;
        const x1 = (letter.x + maxX) * SCALE * HERO_WORD_SCALE;
        const y0 = minY * SCALE * HERO_WORD_SCALE;
        const y1 = maxY * SCALE * HERO_WORD_SCALE;

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
export function Letter3D({ shapes, position, themeKey = "A" }) {
    const groupRef = useRef(null);
    const meshRef = useRef(null);
    const colors = THEMES_COLORS[themeKey] || THEMES_COLORS.A;

    // Extrude every solid of the glyph (each already carries its own
    // holes), so disjoint parts like the "i"/"j" dot are filled too.
    const geometry = useMemo(() => {
        if (!shapes || shapes.length === 0) return null;

        const extrudeSettings = {
            depth: 280,
            steps: 1,
            curveSegments: 6,
            bevelEnabled: true,
            bevelThickness: 45,
            bevelSize: 20,
            bevelSegments: 3,
        };

        return new THREE.ExtrudeGeometry(
            shapes.length === 1 ? shapes[0] : shapes,
            extrudeSettings,
        );
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

    // Drag-to-spin — applied ON TOP of the eased scroll/mouse rotation.
    const baseRot = useRef({ x: 0, y: 0 });
    const dragRot = useRef({ x: 0, y: 0 });
    const dragVel = useRef({ x: 0, y: 0 });
    const dragging = useRef(false);

    useEffect(() => {
        const onMove = (e) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = -(e.clientY / window.innerHeight) * 2 + 1;
            mouseRef.current = { x: nx, y: ny };
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    // Grab-and-spin the wordmark, exactly like the CTA "Let's Go!" text.
    useEffect(() => {
        const hero = document.querySelector(".panel-hero");
        if (!hero) return;
        const prevTA = hero.style.touchAction;
        hero.style.touchAction = "pan-y"; // keep vertical page-scroll on touch

        const IGNORE = 'a, button, input, textarea, select, [role="button"], .nav, .pill, .title-on-cloud, .cloud-seat, .hero-cta';
        const last = { x: 0, y: 0 };

        const down = (e) => {
            if (e.target?.closest?.(IGNORE)) return;
            dragging.current = true;
            last.x = e.clientX;
            last.y = e.clientY;
            dragVel.current = { x: 0, y: 0 };
        };
        const move = (e) => {
            if (!dragging.current) return;
            const dx = e.clientX - last.x;
            const dy = e.clientY - last.y;
            last.x = e.clientX;
            last.y = e.clientY;
            dragRot.current.y += dx * 0.011;
            dragRot.current.x += dy * 0.011;
            dragVel.current = { x: dy * 0.011, y: dx * 0.011 };
        };
        const up = () => { dragging.current = false; };

        hero.addEventListener("pointerdown", down);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
        return () => {
            hero.style.touchAction = prevTA;
            hero.removeEventListener("pointerdown", down);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
            window.removeEventListener("pointercancel", up);
        };
    }, []);

    useFrame((state, delta) => {
        const g = groupRef.current;
        if (!g) return;

        // Smooth mouse parallax + scroll tilt. As the wordmark recedes,
        // turn its face to the right so the backward motion reads in 3D.
        const sp = scrollProgress;
        const mx = mouseRef.current.x * 0.15;
        const my = mouseRef.current.y * 0.08;
        const tiltX = my + sp * 1.2;
        const turnRight = sp * 0.62;
        const groupEase = 1 - Math.pow(0.02, delta);
        baseRot.current.y += (mx + turnRight - baseRot.current.y) * groupEase;
        baseRot.current.x += (tiltX - baseRot.current.x) * groupEase;

        // Drag offset + flick inertia, layered over the base rotation.
        if (!dragging.current) {
            dragRot.current.x += dragVel.current.x;
            dragRot.current.y += dragVel.current.y;
            dragVel.current.x *= 0.92;
            dragVel.current.y *= 0.92;
        }
        g.rotation.y = baseRot.current.y + dragRot.current.y;
        g.rotation.x = baseRot.current.x + dragRot.current.x;
        g.position.z = -sp * 5;
        // Gentle levitation — the whole wordmark drifts up and down on a
        // loop (letters stay rigid). Fades out as the hero scrolls away.
        const tt = state.clock.elapsedTime;
        const lev = 0.32 * Math.sin(tt * 0.7) + 0.08 * Math.sin(tt * 1.25 + 1.4);
        g.position.y = lev * Math.max(0, 1 - sp * 1.6);
        // chunkier wordmark, still centred on origin
        g.scale.setScalar((1 - sp * 0.35) * HERO_WORD_SCALE);

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
            {/* Self-contained lighting rig — no network HDR fetch, so the
                hero can render the instant the font is ready. */}
            <ambientLight intensity={0.5} />
            <hemisphereLight args={["#cfe4ff", "#243049", 0.9]} />
            <directionalLight position={[3, 5, 6]} intensity={3.0} />
            <directionalLight position={[-6, 3, 5]} intensity={2.1} color="#8ec5ff" />
            <pointLight position={[0, -4, 6]} intensity={1.8} color="#6ab0ff" />
            <pointLight position={[6, 2, 3]} intensity={1.1} color="#ffffff" />
            <pointLight position={[-4, -1, 4]} intensity={0.7} color="#ffffff" />
            <Suspense fallback={null}>
                <ScriptWord layoutData={layoutData} scrollProgress={scrollProgress} themeKey={themeKey} />
                <Cursor3D layoutData={layoutData} themeKey={themeKey} />
                <CursorTrail layoutData={layoutData} themeKey={themeKey} />
                <GlitchStickers layoutData={layoutData} />
                <ShimmerSweep />
            </Suspense>
        </>
    );
}

/* ── MAIN COMPONENT ───────────────────────────────────────────────── */

export default function Hero3D({ scrollProgress = 0, themeKey = "A", wordmarkRectRef = null, active = true }) {
    const [layoutData, setLayoutData] = useState(null);
    const stateRef = useRef(null);
    const startRef = useRef(0);
    const activeRef = useRef(active);
    activeRef.current = active;

    useEffect(() => {
        loadFont().then((font) => {
            if (font) {
                setLayoutData(computeLayout(font, WORD));
            }
        });
    }, []);

    // Per-letter viewport rects are computed from the deterministic layout +
    // a fixed camera, so they only change when the canvas is resized — no
    // need to recompute every frame.
    useEffect(() => {
        if (!layoutData || !wordmarkRectRef) return;
        const recompute = () => {
            const canvas = document.querySelector(".hero-canvas-wrap canvas");
            if (canvas) {
                // eslint-disable-next-line react-hooks/immutability -- shared rect cache, read by FallingIcons' rAF loop
                wordmarkRectRef.current = computeWordmarkRects(layoutData, canvas);
            }
        };
        recompute();
        // A couple of delayed passes catch the canvas settling its size.
        const t1 = setTimeout(recompute, 120);
        const t2 = setTimeout(recompute, 500);
        window.addEventListener("resize", recompute);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener("resize", recompute);
        };
    }, [layoutData, wordmarkRectRef]);

    // Drive the render loop with rAF. Pause entirely when the hero is out of
    // view or the tab is hidden so a scrolled-past canvas costs nothing.
    useEffect(() => {
        let raf = 0;
        const loop = () => {
            raf = requestAnimationFrame(loop);
            const state = stateRef.current;
            if (!state || !startRef.current) return;
            if (!activeRef.current || document.hidden) return;
            state.advance((performance.now() - startRef.current) / 1000);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    if (!layoutData) return <div className="hero-canvas" style={{ width: "100%", height: "400px" }} />;

    return (
        <Canvas
            className="hero-canvas"
            dpr={[1, 1.5]}
            frameloop="never"
            camera={{ position: [0, 2.5, 14], fov: 42 }}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false, powerPreference: "high-performance" }}
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

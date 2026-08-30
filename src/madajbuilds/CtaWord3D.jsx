import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { loadFont, computeLayout, Letter3D, SCALE } from "./Hero3D.jsx";

const DEFAULT_WORD = "Let's Go";
const DEFAULT_CAMERA = { position: [0, 2.5, 14], fov: 42 };

/* The puffy 3D balloon wordmark from the hero. `idle` gives it a slow
   auto sway/breathe; when it's draggable the sway is dropped so it
   doesn't fight the user's spin. */
function Word({ layoutData, themeKey, groupRef, idle, floatAmp }) {
    const letterRefs = useRef([]);

    useFrame((state) => {
        const g = groupRef.current;
        if (!g) return;
        const t = state.clock.elapsedTime;

        // Levitation — the whole word visibly rides up and down on a soft
        // gravity, forever. Two sines keep it from feeling metronomic.
        // Only touches position, so it never fights a drag (rotation).
        const wave = 0.82 * Math.sin(t * 0.75) + 0.18 * Math.sin(t * 1.3 + 1.7);
        g.position.y = floatAmp * (0.15 + wave);
        if (idle) {
            g.rotation.y = Math.sin(t * 0.32) * 0.3;
            g.rotation.x = -0.04 + Math.sin(t * 0.24) * 0.05;
        }
        // The letters stay rigid — the whole word levitates as one piece.
    });

    return (
        <group ref={groupRef}>
            {layoutData.map((letter, i) => {
                if (letter.shapes.length === 0) return null;
                return (
                    <group
                        key={`${letter.ch}-${i}`}
                        ref={(el) => { letterRefs.current[i] = el; }}
                        position={[letter.x * SCALE, 0, 0]}
                    >
                        <Letter3D shapes={letter.shapes} position={[0, 0, 0]} themeKey={themeKey} />
                    </group>
                );
            })}
        </group>
    );
}

/* Grab-and-spin the wordmark on any axis, with a flick-to-keep-spinning
   inertia and a gentle turntable idle until the first touch. */
function DragSpin({ targetRef, scrollLock }) {
    const { gl } = useThree();
    const drag = useRef(null);
    const vel = useRef({ x: 0, y: 0 });
    const touched = useRef(false);

    useEffect(() => {
        const el = gl.domElement;
        el.style.cursor = "grab";
        // scrollLock: capture both axes (popup). otherwise let the page
        // still scroll vertically past it (in-page section) — horizontal
        // drag still spins it.
        el.style.touchAction = scrollLock ? "none" : "pan-y";
        // re-enable hit-testing on the canvas even if a wrapper set
        // pointer-events:none for the decorative (non-draggable) case
        el.style.pointerEvents = "auto";

        const pos = (e) => ({
            x: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
            y: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
        });
        const down = (e) => {
            drag.current = pos(e);
            touched.current = true;
            vel.current = { x: 0, y: 0 };
            el.style.cursor = "grabbing";
        };
        const move = (e) => {
            if (!drag.current) return;
            const p = pos(e);
            const dx = p.x - drag.current.x;
            const dy = p.y - drag.current.y;
            drag.current = p;
            const g = targetRef.current;
            if (g) {
                g.rotation.y += dx * 0.013;
                g.rotation.x += dy * 0.013;
            }
            vel.current = { x: dy * 0.013, y: dx * 0.013 };
        };
        const up = () => {
            drag.current = null;
            el.style.cursor = "grab";
        };

        el.addEventListener("pointerdown", down);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
        return () => {
            el.removeEventListener("pointerdown", down);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", up);
            window.removeEventListener("pointercancel", up);
        };
    }, [gl, targetRef, scrollLock]);

    useFrame(() => {
        const g = targetRef.current;
        if (!g || drag.current) return;
        g.rotation.x += vel.current.x;
        g.rotation.y += vel.current.y;
        vel.current.x *= 0.93;
        vel.current.y *= 0.93;
        if (!touched.current) g.rotation.y += 0.006; // idle turntable
    });

    return null;
}

export default function CtaWord3D({
    word = DEFAULT_WORD,
    themeKey = "A",
    className = "cta-word3d",
    camera = DEFAULT_CAMERA,
    dpr = [1, 1.5],
    draggable = false,
    scrollLock = true,
    floatAmp = 0.35,
}) {
    const [layoutData, setLayoutData] = useState(null);
    const wrapRef = useRef(null);
    const groupRef = useRef(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        loadFont().then((font) => {
            if (font) setLayoutData(computeLayout(font, word));
        });
    }, [word]);

    // Only run the render loop while it's near the viewport.
    useEffect(() => {
        const el = wrapRef.current;
        if (!el || !("IntersectionObserver" in window)) { setActive(true); return; }
        const io = new IntersectionObserver(
            ([e]) => setActive(e.isIntersecting),
            { rootMargin: "600px 0px" },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={wrapRef} className={className} aria-hidden="true">
            {layoutData && (
                <Canvas
                    dpr={dpr}
                    frameloop={active ? "always" : "never"}
                    camera={camera}
                    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <ambientLight intensity={0.5} />
                    <hemisphereLight args={["#cfe4ff", "#243049", 0.9]} />
                    <directionalLight position={[3, 5, 6]} intensity={3.0} />
                    <directionalLight position={[-6, 3, 5]} intensity={2.1} color="#8ec5ff" />
                    <pointLight position={[0, -4, 6]} intensity={1.8} color="#6ab0ff" />
                    <pointLight position={[6, 2, 3]} intensity={1.1} color="#ffffff" />
                    <Suspense fallback={null}>
                        <Word
                            layoutData={layoutData}
                            themeKey={themeKey}
                            groupRef={groupRef}
                            idle={!draggable}
                            floatAmp={floatAmp}
                        />
                        {draggable && <DragSpin targetRef={groupRef} scrollLock={scrollLock} />}
                    </Suspense>
                </Canvas>
            )}
        </div>
    );
}

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { loadFont, computeLayout, Letter3D, SCALE } from "./Hero3D.jsx";

const CTA_WORD = "Let's Go";

/* The same puffy 3D balloon-script wordmark as the hero, but static —
   a slow idle sway/breathe, no scroll or mouse coupling. Sits behind the
   CTA headline. */
function Word({ layoutData, themeKey }) {
    const groupRef = useRef(null);
    const letterRefs = useRef([]);

    useFrame((state) => {
        const g = groupRef.current;
        if (!g) return;
        const t = state.clock.elapsedTime;
        g.rotation.y = Math.sin(t * 0.32) * 0.3;
        g.rotation.x = -0.04 + Math.sin(t * 0.24) * 0.05;
        g.position.y = Math.sin(t * 0.45) * 0.12;

        letterRefs.current.forEach((ref, i) => {
            if (!ref) return;
            const s = 1 + Math.sin(t * 0.9 + i * 0.55) * 0.03;
            ref.scale.setScalar(s);
            ref.position.y = Math.sin(t * 0.8 + i * 0.7) * 0.04;
        });
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

export default function CtaWord3D({ themeKey = "A" }) {
    const [layoutData, setLayoutData] = useState(null);
    const wrapRef = useRef(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        loadFont().then((font) => {
            if (font) setLayoutData(computeLayout(font, CTA_WORD));
        });
    }, []);

    // Only run the render loop while the CTA is near the viewport.
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
        <div ref={wrapRef} className="cta-word3d" aria-hidden="true">
            {layoutData && (
                <Canvas
                    dpr={[1, 1.5]}
                    frameloop={active ? "always" : "never"}
                    camera={{ position: [0, 2.5, 14], fov: 42 }}
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
                        <Word layoutData={layoutData} themeKey={themeKey} />
                    </Suspense>
                </Canvas>
            )}
        </div>
    );
}

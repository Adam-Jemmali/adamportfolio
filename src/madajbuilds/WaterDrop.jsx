import { useEffect, useRef } from "react";

/**
 * Glowing orb that follows the cursor with eased lerp.
 * Ocean-blue radial gradient with mix-blend-mode: screen.
 * Fades out when scrollProgress > ~0.67.
 */
export default function WaterDrop({ scrollProgress = 0 }) {
    const ref = useRef(null);
    const pos = useRef({ x: -200, y: -200 });
    const target = useRef({ x: -200, y: -200 });
    const rafRef = useRef(null);

    useEffect(() => {
        const onMove = (e) => {
            target.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", onMove);

        const tick = () => {
            const el = ref.current;
            if (!el) return;

            pos.current.x += (target.current.x - pos.current.x) * 0.12;
            pos.current.y += (target.current.y - pos.current.y) * 0.12;

            const opacity = Math.max(0, 1 - scrollProgress * 2.2);

            el.style.transform = `translate(${pos.current.x - 90}px, ${pos.current.y - 90}px)`;
            el.style.opacity = opacity;

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener("mousemove", onMove);
        };
    }, [scrollProgress]);

    return (
        <div
            ref={ref}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background:
                    "radial-gradient(circle, rgba(100,180,255,0.25) 0%, rgba(34,211,238,0.15) 40%, transparent 70%)",
                mixBlendMode: "screen",
                pointerEvents: "none",
                zIndex: 7,
                willChange: "transform, opacity",
            }}
            aria-hidden="true"
        />
    );
}

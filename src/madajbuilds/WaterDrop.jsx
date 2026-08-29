import { useEffect, useRef } from "react";

/**
 * Glowing orb that follows the cursor with eased lerp.
 * Fades out when scrollProgress rises. scrollProgress is read through a
 * ref so a scroll never tears down and rebuilds the rAF loop / listeners.
 */
export default function WaterDrop({ scrollProgressRef }) {
    const ref = useRef(null);
    const pos = useRef({ x: -200, y: -200 });
    const target = useRef({ x: -200, y: -200 });

    useEffect(() => {
        const onMove = (e) => {
            target.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", onMove, { passive: true });

        let raf = 0;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            const el = ref.current;
            if (!el || document.hidden) return;

            pos.current.x += (target.current.x - pos.current.x) * 0.12;
            pos.current.y += (target.current.y - pos.current.y) * 0.12;

            const opacity = Math.max(0, 1 - (scrollProgressRef.current || 0) * 2.2);
            el.style.transform = `translate(${pos.current.x - 90}px, ${pos.current.y - 90}px)`;
            el.style.opacity = opacity;
        };

        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("mousemove", onMove);
        };
    }, [scrollProgressRef]);

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

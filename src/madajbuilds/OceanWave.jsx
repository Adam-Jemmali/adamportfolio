import { useEffect, useRef } from "react";

/**
 * Full-viewport canvas that renders layered ocean-blue sine waves.
 * Waves warp and peak near the cursor. Fades out with scrollProgress.
 *
 * scrollProgress is read through a ref so a scroll never tears down and
 * rebuilds the canvas / rAF loop / listeners.
 */
export default function OceanWave({ scrollProgressRef, hoverRef }) {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0.5, y: 0.5 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        let dpr = 1;
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        window.addEventListener("resize", resize);

        const onMouse = (e) => {
            mouseRef.current = {
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight,
            };
        };
        window.addEventListener("mousemove", onMouse, { passive: true });

        // Thin lines spread across the WHOLE section, not filled bands
        // pooling at the bottom.
        const WAVE_COUNT = 11;
        const phases = Array.from({ length: WAVE_COUNT }, () => Math.random() * Math.PI * 2);
        const STEP = (window.devicePixelRatio || 1) > 1.5 ? 7 : 5;
        const SLOPE = -0.045; // gentle diagonal drift

        let raf = 0;
        let cleared = false;
        let hover = 0; // eased 0→1 while the hero section is hovered

        const draw = (t) => {
            raf = requestAnimationFrame(draw);

            if (document.hidden) return;

            const w = window.innerWidth;
            const h = window.innerHeight;
            // Ease the hover intensity so the waves swell/settle smoothly.
            hover += ((hoverRef && hoverRef.current ? 1 : 0) - hover) * 0.045;
            // Discreet: hover only lifts the lines a little.
            const boost = 1 + hover * 1.7;
            const opacity = Math.max(0, 1 - (scrollProgressRef.current || 0) * 1.5);

            if (opacity <= 0) {
                // Hero scrolled away — clear once, then idle cheaply.
                if (!cleared) {
                    ctx.clearRect(0, 0, w, h);
                    cleared = true;
                }
                return;
            }
            cleared = false;
            ctx.clearRect(0, 0, w, h);

            const mx = mouseRef.current.x * w;
            ctx.lineWidth = 1.4;

            for (let i = 0; i < WAVE_COUNT; i++) {
                // spread from ~4% to ~96% of the viewport height
                const yBase = h * (0.04 + i * (0.92 / (WAVE_COUNT - 1)));
                const amplitude = (9 + (i % 3) * 5) * (1 + hover * 0.28);
                const freq = 0.0015 + (i % 4) * 0.00035;
                const speed = 0.14 + i * 0.045;
                const lineOpacity = (0.018 + (i % 3) * 0.006) * opacity * boost;

                ctx.beginPath();
                for (let x = 0; x <= w; x += STEP) {
                    const distX = (x - mx) / w;
                    const push = Math.exp(-distX * distX * 10) * 12 * (1 + hover * 0.6);
                    const y =
                        yBase +
                        x * SLOPE +
                        Math.sin(x * freq + t * speed + phases[i]) * amplitude -
                        push;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = `rgba(120, 190, 255, ${lineOpacity})`;
                ctx.stroke();
            }
        };

        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouse);
        };
    }, [scrollProgressRef, hoverRef]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1,
                pointerEvents: "none",
            }}
            aria-hidden="true"
        />
    );
}

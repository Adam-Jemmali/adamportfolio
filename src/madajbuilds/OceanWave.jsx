import { useEffect, useRef } from "react";

/**
 * Full-viewport canvas that renders layered ocean-blue sine waves.
 * Waves warp and peak near the cursor. Fades out with scrollProgress.
 *
 * scrollProgress is read through a ref so a scroll never tears down and
 * rebuilds the canvas / rAF loop / listeners.
 */
export default function OceanWave({ scrollProgressRef }) {
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

        const WAVE_COUNT = 5;
        const phases = Array.from({ length: WAVE_COUNT }, () => Math.random() * Math.PI * 2);
        const STEP = (window.devicePixelRatio || 1) > 1.5 ? 6 : 4;

        let raf = 0;
        let cleared = false;

        const draw = (t) => {
            raf = requestAnimationFrame(draw);

            if (document.hidden) return;

            const w = window.innerWidth;
            const h = window.innerHeight;
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

            for (let i = 0; i < WAVE_COUNT; i++) {
                const yBase = h * (0.45 + i * 0.11);
                const amplitude = 12 + i * 6;
                const freq = 0.002 + i * 0.0004;
                const speed = 0.3 + i * 0.15;
                const waveOpacity = (0.03 + i * 0.008) * opacity;

                ctx.beginPath();
                ctx.moveTo(0, h);

                for (let x = 0; x <= w; x += STEP) {
                    const distX = (x - mx) / w;
                    const push = Math.exp(-distX * distX * 12) * 25;
                    const y =
                        yBase +
                        Math.sin(x * freq + t * speed + phases[i]) * amplitude -
                        push;
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(w, h);
                ctx.closePath();
                ctx.fillStyle = `rgba(100, 180, 255, ${waveOpacity})`;
                ctx.fill();
            }
        };

        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouse);
        };
    }, [scrollProgressRef]);

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

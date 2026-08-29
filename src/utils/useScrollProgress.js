import { useEffect, useRef, useState } from "react";

/**
 * Tracks scroll progress through the hero section (0 → 1) and whether
 * the hero is still in view.
 *
 * Event-driven (scroll / resize) with a single rAF coalesce, and it only
 * pushes a new React state when the value actually moved by a meaningful
 * amount. At rest it does zero work — nothing re-renders. This keeps the
 * whole tree (3D canvas included) from re-rendering on every frame.
 *
 * @param {React.RefObject} heroRef – ref to the hero section element
 * @returns {{ scrollProgress: number, heroInView: boolean }}
 */
export function useScrollProgress(heroRef) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [heroInView, setHeroInView] = useState(true);
    const lastProgress = useRef(0);
    const lastInView = useRef(true);
    const rafRef = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const measure = () => {
            ticking.current = false;
            const rect = hero.getBoundingClientRect();
            const heroH = rect.height || window.innerHeight;
            const clamped = Math.max(0, Math.min(1, -rect.top / heroH));

            const prev = lastProgress.current;
            const snappedEdge =
                (clamped === 0 && prev !== 0) || (clamped === 1 && prev !== 1);
            if (Math.abs(clamped - prev) > 0.004 || snappedEdge) {
                lastProgress.current = clamped;
                setScrollProgress(clamped);
            }

            const inView = clamped < 0.95;
            if (inView !== lastInView.current) {
                lastInView.current = inView;
                setHeroInView(inView);
            }
        };

        const onScroll = () => {
            if (ticking.current) return;
            ticking.current = true;
            rafRef.current = requestAnimationFrame(measure);
        };

        measure();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [heroRef]);

    return { scrollProgress, heroInView };
}

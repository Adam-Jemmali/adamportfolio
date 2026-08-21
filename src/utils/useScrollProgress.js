import { useEffect, useRef, useState } from "react";

/**
 * Tracks scroll progress through the hero section (0 → 1) and whether
 * the hero is still in view. Uses requestAnimationFrame for performant,
 * jank-free tracking.
 *
 * @param {React.RefObject} heroRef – ref to the hero section element
 * @returns {{ scrollProgress: number, heroInView: boolean }}
 */
export function useScrollProgress(heroRef) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [heroInView, setHeroInView] = useState(true);
    const rafRef = useRef(null);
    const progressRef = useRef(0);

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        const tick = () => {
            const rect = hero.getBoundingClientRect();
            const heroH = rect.height || window.innerHeight;
            const raw = -rect.top / heroH;
            const clamped = Math.max(0, Math.min(1, raw));

            progressRef.current = clamped;
            setScrollProgress(clamped);
            setHeroInView(clamped < 0.95);

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [heroRef]);

    return { scrollProgress, heroInView };
}

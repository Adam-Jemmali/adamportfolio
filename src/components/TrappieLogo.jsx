import { useEffect, useRef } from "react";

// Trappie's mascot mark. The pupils follow the cursor and blink on a loop so
// the tour guide feels alive. Used anywhere we want the animated version; the
// static t-monogram.svg keeps the same design for plain <img> icons.
const TrappieLogo = ({ size = 48, className = "" }) => {
    const rootRef = useRef(null);
    const pupilL = useRef(null);
    const pupilR = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        let raf = 0;
        const pupils = [pupilL.current, pupilR.current];

        const handleMove = (event) => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const rect = root.getBoundingClientRect();
                if (!rect.width || !rect.height) return;

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = event.clientX - centerX;
                const dy = event.clientY - centerY;
                const dist = Math.hypot(dx, dy);

                if (dist < 4) {
                    pupils.forEach((p) => p && (p.style.transform = "translate(0px, 0px)"));
                    return;
                }

                // Keep the pupils inside the eyes no matter how far away the cursor is.
                const reach = Math.min(dist, 300) / 300;
                const max = 5.5;
                const ox = (dx / dist) * reach * max;
                const oy = (dy / dist) * reach * max;

                pupils.forEach((p) => p && (p.style.transform = `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`));
            });
        };

        window.addEventListener("mousemove", handleMove);
        return () => {
            window.removeEventListener("mousemove", handleMove);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <svg
            ref={rootRef}
            className={`trappie-logo ${className}`.trim()}
            width={size}
            height={size}
            viewBox="10 20 170 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Trappie"
        >
            <defs>
                <linearGradient id="t-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
                <linearGradient id="t-accent-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#BEF264" />
                    <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
            </defs>

            <path d="M 50 30 H 150 V 58 H 112 V 160 H 88 V 58 H 50 Z" fill="url(#t-body-grad)" />
            <rect x="156" y="30" width="22" height="8" rx="4" fill="url(#t-accent-grad)" />
            <rect x="156" y="44" width="14" height="8" rx="4" fill="url(#t-accent-grad)" />
            <circle cx="175" cy="62" r="4" fill="#BEF264" />

            <g className="trappie-eye">
                <circle cx="76" cy="45" r="13" fill="#FFFFFF" />
                <g ref={pupilL} className="trappie-pupil">
                    <circle cx="76" cy="45" r="6" fill="#0B1526" />
                    <circle cx="73.5" cy="42.5" r="2" fill="#FFFFFF" />
                </g>
            </g>

            <g className="trappie-eye">
                <circle cx="124" cy="45" r="13" fill="#FFFFFF" />
                <g ref={pupilR} className="trappie-pupil">
                    <circle cx="124" cy="45" r="6" fill="#0B1526" />
                    <circle cx="121.5" cy="42.5" r="2" fill="#FFFFFF" />
                </g>
            </g>
        </svg>
    );
};

export default TrappieLogo;

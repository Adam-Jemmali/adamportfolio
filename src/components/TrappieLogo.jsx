import { useEffect, useRef } from "react";

// Trappie's mascot mark. The pupils follow the cursor and blink on a loop so
// the tour guide feels alive. A `wink` signal triggers a quick wink plus a
// little sparkle (used when the tour advances).
const TrappieLogo = ({ size = 48, className = "", wink = 0, happy = false }) => {
    const rootRef = useRef(null);
    const pupilL = useRef(null);
    const pupilR = useRef(null);
    const eyeL = useRef(null);
    const eyeR = useRef(null);
    const sparkleRef = useRef(null);

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

    // Wink + sparkle whenever the tour tells Trappie to react.
    useEffect(() => {
        if (!wink) return;

        if (eyeR.current) {
            eyeR.current.animate(
                [
                    { transform: "scaleY(1)" },
                    { transform: "scaleY(0.12)", offset: 0.5 },
                    { transform: "scaleY(1)" },
                ],
                { duration: 460, easing: "ease-in-out" }
            );
        }

        if (sparkleRef.current) {
            sparkleRef.current.animate(
                [
                    { opacity: 0, transform: "scale(0) rotate(0deg)" },
                    { opacity: 1, transform: "scale(1) rotate(18deg)", offset: 0.4 },
                    { opacity: 0, transform: "scale(0.4) rotate(36deg)" },
                ],
                { duration: 640, easing: "ease-out" }
            );
        }
    }, [wink]);

    // Happy squint on the outro step: both eyes squeeze and a sparkle pops.
    useEffect(() => {
        if (!happy) return;

        [eyeL.current, eyeR.current].forEach((eye) => {
            if (eye) {
                eye.animate(
                    [
                        { transform: "scaleY(1)" },
                        { transform: "scaleY(0.3)", offset: 0.35 },
                        { transform: "scaleY(0.55)", offset: 0.65 },
                        { transform: "scaleY(1)" },
                    ],
                    { duration: 720, easing: "ease-in-out" }
                );
            }
        });

        if (sparkleRef.current) {
            sparkleRef.current.animate(
                [
                    { opacity: 0, transform: "scale(0) rotate(0deg)" },
                    { opacity: 1, transform: "scale(1) rotate(18deg)", offset: 0.4 },
                    { opacity: 0, transform: "scale(0.4) rotate(36deg)" },
                ],
                { duration: 700, easing: "ease-out" }
            );
        }
    }, [happy]);

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
            </defs>

            <path d="M 50 30 H 150 V 58 H 112 V 160 H 88 V 58 H 50 Z" fill="url(#t-body-grad)" />

            <g ref={eyeL} className="trappie-eye">
                <circle cx="76" cy="45" r="13" fill="#FFFFFF" />
                <g ref={pupilL} className="trappie-pupil">
                    <circle cx="76" cy="45" r="6" fill="#0B1526" />
                    <circle cx="73.5" cy="42.5" r="2" fill="#FFFFFF" />
                </g>
            </g>

            <g ref={eyeR} className="trappie-eye">
                <circle cx="124" cy="45" r="13" fill="#FFFFFF" />
                <g ref={pupilR} className="trappie-pupil">
                    <circle cx="124" cy="45" r="6" fill="#0B1526" />
                    <circle cx="121.5" cy="42.5" r="2" fill="#FFFFFF" />
                </g>
            </g>

            <path
                ref={sparkleRef}
                className="trappie-sparkle"
                d="M 140 16 Q 141.5 22 148 24 Q 141.5 26 140 32 Q 138.5 26 132 24 Q 138.5 22 140 16 Z"
                fill="#FFFFFF"
            />
        </svg>
    );
};

export default TrappieLogo;

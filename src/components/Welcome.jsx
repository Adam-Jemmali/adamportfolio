import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const renderText = (text, className, baseWeight = 400) => {
    return [...text].map((char, i) => (
        <span
            key={i}
            className={className}
            style={{ fontVariationSettings: `"wght" ${baseWeight}` }}
        >
            {char === " " ? "\u00A0" : char}
        </span>
    ));
};

const FONTS_WEIGHTS = {
    subtitle: { min: 100, max: 400, default: 100 },
    title: { min: 400, max: 900, default: 400 },
};

// hover selection logic
const setTextHover = (container, type) => {
    if (!container) return;

    const letters = container.querySelectorAll("span");
    const { min, max, default: base } = FONTS_WEIGHTS[type];

    const mousemove = (e) => {
        const { left } = container.getBoundingClientRect();
        const mouseX = e.clientX - left;

        letters.forEach((letter) => {
            const { left: l, width: w } = letter.getBoundingClientRect();
            const distance = Math.abs(mouseX - (l - left + w / 2));
            const intensity = Math.exp(-(distance ** 2) / 20000);
            const weight = min + (max - min) * intensity;

            // Kill existing tweens and set immediately for smooth effect
            gsap.killTweensOf(letter);
            gsap.set(letter, {
                fontVariationSettings: `"wght" ${weight}`,
            });
        });
    };

    const mouseleave = () => {
        letters.forEach((letter) => {
            gsap.killTweensOf(letter);
            gsap.to(letter, {
                duration: 0.3,
                ease: "power2.out",
                fontVariationSettings: `"wght" ${base}`,
            });
        });
    };

    container.addEventListener("mousemove", mousemove);
    container.addEventListener("mouseleave", mouseleave);

    return () => {
        container.removeEventListener("mousemove", mousemove);
        container.removeEventListener("mouseleave", mouseleave);
    };
};

const Welcome = () => {
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);

    useGSAP(() => {
        const cleanup = setTextHover(titleRef.current, "title");
        const subtitleCleanup = setTextHover(subtitleRef.current, "subtitle");

        return () => {
            cleanup?.();
            subtitleCleanup?.();
        };
    }, []);

    return (
        <section id="welcome">
            <p ref={subtitleRef}>
                {renderText("Im Adam! Welcome to my ", "text-1xl font-georama", 100)}
            </p>

            <h1 ref={titleRef} className="mt-7">
                {renderText("PORTFOLIO", "text-6xl italic font-georama", 400)}
            </h1>
        </section>
    );
};

export default Welcome;
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ROLES = [
    "full-stack apps",
    "AI systems that remember",
    "cloud backends",
    "things that actually ship",
];

const renderText = (text) =>
    [...text].map((char, i) => (
        <span key={i}>{char === " " ? "\u00A0" : char}</span>
    ));

// Per-letter weight response on hover (variable font) + gradient that follows the mouse.
const setTitleHover = (container) => {
    if (!container) return;
    const letters = container.querySelectorAll("span");

    const mousemove = (e) => {
        const { left, width } = container.getBoundingClientRect();
        const mouseX = e.clientX - left;

        // Shift the pfp gradient so it follows the cursor.
        const pct = Math.max(0, Math.min(100, (mouseX / width) * 100));
        gsap.to(container, { backgroundPosition: `${pct}% 50%`, duration: 0.25, ease: "power1.out" });

        letters.forEach((letter) => {
            const { left: l, width: w } = letter.getBoundingClientRect();
            const distance = Math.abs(mouseX - (l - left + w / 2));
            const intensity = Math.exp(-(distance ** 2) / 20000);
            gsap.killTweensOf(letter);
            gsap.set(letter, { fontVariationSettings: `"wght" ${400 + 500 * intensity}` });
        });
    };

    const mouseleave = () => {
        gsap.to(container, { backgroundPosition: "0% 50%", duration: 0.5, ease: "power2.out" });
        letters.forEach((letter) => {
            gsap.killTweensOf(letter);
            gsap.to(letter, { duration: 0.3, ease: "power2.out", fontVariationSettings: `"wght" 400` });
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
    const [typed, setTyped] = useState("");

    // Typewriter loop.
    useEffect(() => {
        let role = 0;
        let char = 0;
        let deleting = false;
        let timer;

        const tick = () => {
            const word = ROLES[role];
            if (!deleting) {
                char += 1;
                setTyped(word.slice(0, char));
                if (char === word.length) {
                    deleting = true;
                    timer = setTimeout(tick, 1500);
                    return;
                }
                timer = setTimeout(tick, 85);
            } else {
                char -= 1;
                setTyped(word.slice(0, char));
                if (char === 0) {
                    deleting = false;
                    role = (role + 1) % ROLES.length;
                    timer = setTimeout(tick, 450);
                    return;
                }
                timer = setTimeout(tick, 40);
            }
        };

        timer = setTimeout(tick, 500);
        return () => clearTimeout(timer);
    }, []);

    useGSAP(() => {
        const cleanup = setTitleHover(titleRef.current);
        gsap.fromTo(
            "#welcome > *",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.2 }
        );
        return () => cleanup?.();
    }, []);

    return (
        <section id="welcome">
            <h1 ref={titleRef} className="hero-title">
                {renderText("@madajbuilds")}
            </h1>

            <p className="hero-type">
                <span>I build&nbsp;</span>
                {typed}
                <span className="caret" />
            </p>
        </section>
    );
};

export default Welcome;

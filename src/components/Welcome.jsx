import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Send } from "lucide-react";
import useWindowStore from "#store/window.js";
import BrandName from "#components/BrandName.jsx";

const ROLES = [
    "computer vision systems",
    "agentic AI",
    "sports analytics",
    "things that actually ship",
];

// Per-letter weight response on hover (variable font).
const setTitleHover = (container) => {
    if (!container) return;
    const letters = container.querySelectorAll(".hero-letter");

    const mousemove = (e) => {
        const { left } = container.getBoundingClientRect();
        const mouseX = e.clientX - left;

        letters.forEach((letter) => {
            const { left: l, width: w } = letter.getBoundingClientRect();
            const distance = Math.abs(mouseX - (l - left + w / 2));
            const intensity = Math.exp(-(distance ** 2) / 20000);
            gsap.killTweensOf(letter);
            gsap.set(letter, { fontVariationSettings: `"wght" ${400 + 500 * intensity}` });
        });
    };

    const mouseleave = () => {
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

    const { openWindow, focusWindow } = useWindowStore();

    const openContact = () => {
        openWindow("contact");
        focusWindow("contact");
    };

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
        const monograms = titleRef.current?.querySelectorAll(".brand-monogram");
        gsap.fromTo(
            "#welcome > *",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.2 }
        );
        // A + J gravity-fall into the name (same motion as the boot screen).
        gsap.fromTo(
            monograms,
            { y: -window.innerHeight * 0.85, opacity: 0, rotation: 0, scale: 1.55 },
            { y: 0, opacity: 1, rotation: 360, scale: 1, duration: 2.2, ease: "bounce.out", stagger: 0.26, overwrite: true }
        );
        return () => cleanup?.();
    }, []);

    return (
        <section id="welcome">
            <div className="hero-brand" ref={titleRef}>
                <h1 className="hero-title"><BrandName animated /></h1>
            </div>

            <p className="hero-type">
                <span>I build&nbsp;</span>
                {typed}
                <span className="caret" />
            </p>

            <div className="hero-ctas">
                <button type="button" className="hero-cta hero-cta-secondary" onClick={openContact}>
                    <Send size={15} />
                    Get in touch
                </button>
            </div>
        </section>
    );
};

export default Welcome;

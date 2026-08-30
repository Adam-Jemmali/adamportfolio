import { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Send } from "lucide-react";
import useWindowStore from "#store/window.js";
import PixelTitle from "#components/PixelTitle.jsx";

const ROLES = [
    "ML systems",
    "AI automation",
    "sports & edtech tools",
    "things that actually ship",
];

const Welcome = () => {
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
        gsap.fromTo(
            "#welcome .hero-type, #welcome .hero-ctas",
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.2 }
        );
    }, []);

    return (
        <section id="welcome">
            <div className="hero-portrait-block">
                <span className="hero-portrait-signature" aria-hidden="true">adam jemmali</span>
                <div className="hero-portrait-wrap">
                    <img src="/public/images/adam_Me.png" alt="Adam Jemmali" className="hero-portrait" />
                    <div className="hero-portrait-shimmer" aria-hidden="true" />
                </div>
            </div>

            <div className="hero-brand">
                <h1 className="hero-title"><PixelTitle /></h1>
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

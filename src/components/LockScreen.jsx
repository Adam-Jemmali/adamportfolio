import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import useSystemStore from "#store/system.js";
import PowerMenu from "./PowerMenu.jsx";
import BrandName from "#components/BrandName.jsx";

const HINTS = [
    'The password is "password" maybe who knows.',
    'Any password works.Seriously, try it.',
    "The gatekeeper is on a coffee break.",
    'Type literally anything.Yes, even "1234".',
    
];

const LockScreen = () => {
    const unlock = useSystemStore((s) => s.unlock);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [hintIndex, setHintIndex] = useState(0);
    const [time, setTime] = useState(dayjs());
    const rootRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const id = setInterval(() => setTime(dayjs()), 1000);
        return () => clearInterval(id);
    }, []);

    useGSAP(() => {
        gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        gsap.fromTo(
            cardRef.current,
            { y: -30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
        );
    }, []);

    useEffect(() => {
        const id = setInterval(() => setHintIndex((i) => (i + 1) % HINTS.length), 3200);
        return () => clearInterval(id);
    }, []);

    useGSAP(() => {
        gsap.fromTo(".lock-hint", { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4 });
    }, [hintIndex]);

    const submit = (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError(true);
            gsap.fromTo(
                cardRef.current,
                { x: 0 },
                { x: 10, duration: 0.05, repeat: 5, yoyo: true, onComplete: () => gsap.set(cardRef.current, { x: 0 }) }
            );
            return;
        }

        gsap.to(rootRef.current, {
            opacity: 0,
            filter: "blur(10px)",
            duration: 0.6,
            ease: "power2.in",
            onComplete: unlock,
        });
    };

    return (
        <section ref={rootRef} className="lock-screen">
            <div className="lock-blur" />

            <div className="lock-clock">
                <p className="lock-time">{time.format("h:mm")}</p>
                <p className="lock-date">{time.format("dddd, MMMM D")}</p>
            </div>

            <div ref={cardRef} className="lock-card">
                <div className="lock-initials">A J</div>
                <h1><BrandName /></h1>

                <form className="lock-form" onSubmit={submit}>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        autoFocus
                        aria-label="Password"
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError(false);
                        }}
                    />
                    <button type="submit" className="lock-submit" aria-label="Log in">
                        <ArrowRight size={18} />
                    </button>
                </form>

                {error && <p className="lock-error">Please enter a password</p>}
                <p className="lock-hint">{HINTS[hintIndex]}</p>
            </div>

            <div className="lock-power">
                <PowerMenu />
            </div>
        </section>
    );
};

export default LockScreen;

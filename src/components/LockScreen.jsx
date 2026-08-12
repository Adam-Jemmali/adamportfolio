import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import useSystemStore from "#store/system.js";
import PowerMenu from "./PowerMenu.jsx";

const LockScreen = () => {
    const unlock = useSystemStore((s) => s.unlock);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const rootRef = useRef(null);
    const cardRef = useRef(null);

    useGSAP(() => {
        gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        gsap.fromTo(
            cardRef.current,
            { y: -30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
        );
    }, []);

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

            <div ref={cardRef} className="lock-card">
                <img src="/public/images/adam_Me.png" alt="Adam Jemmali" className="lock-avatar" />
                <h1>Adam Jemmali</h1>

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
                <p className="lock-hint">Demo — type anything to unlock</p>
            </div>

            <div className="lock-power">
                <PowerMenu />
            </div>
        </section>
    );
};

export default LockScreen;

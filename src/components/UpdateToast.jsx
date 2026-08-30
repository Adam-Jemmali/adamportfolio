import { useEffect, useState } from "react";
import useSystemStore from "#store/system.js";

// A discoverable alternative to the hidden "click the clock 3×" easter
// egg: a retro update-nag that slides in bottom-right, stays until
// dismissed, and jumps to the madajbuilds page when pressed.
const APPEAR_DELAY_MS = 1000;
const OUT_MS = 420;

const ArrowGlyph = () => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7M8 7h9v9" />
    </svg>
);

const UpdateToast = () => {
    const screen = useSystemStore((s) => s.screen);
    const startTimeTravel = useSystemStore((s) => s.startTimeTravel);
    // "pending" → wait, "in" → showing, "out" → sliding away, "gone" → unmounted
    const [phase, setPhase] = useState("pending");

    useEffect(() => {
        if (screen !== "desktop") return;
        const t = setTimeout(() => setPhase("in"), APPEAR_DELAY_MS);
        return () => clearTimeout(t);
    }, [screen]);

    if (phase === "pending" || phase === "gone" || screen !== "desktop") return null;

    const dismiss = () => {
        setPhase("out");
        setTimeout(() => setPhase("gone"), OUT_MS);
    };

    const open = () => {
        setPhase("out");
        startTimeTravel();
    };

    return (
        <div className={`update-toast ${phase === "out" ? "update-toast-out" : ""}`} role="alert">
            <div className="update-toast-bar">
                <span className="update-toast-title">✦ AJ OS Content Creation </span>
                <button type="button" className="update-toast-x" onClick={dismiss} aria-label="Dismiss">
                    ✕
                </button>
            </div>
            <div className="update-toast-body">
                <p>Where I build in public and share everything.</p>
                <p className="update-toast-hint">
                    2 ways in: this button, or triple-click the clock up in the menu bar <span aria-hidden="true">👀</span>
                </p>

                <button type="button" className="update-toast-install" onClick={open}>
                    <ArrowGlyph /> My content page
                </button>
            </div>
        </div>
    );
};

export default UpdateToast;

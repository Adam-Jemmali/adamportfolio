import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import useSystemStore from "#store/system.js";

// A discoverable alternative to the hidden "click the clock 3×" easter
// egg: a retro update-nag that slides in bottom-right, sits for 10s, and
// jumps to the madajbuilds build when pressed.
const APPEAR_DELAY_MS = 1000;
const VISIBLE_MS = 10000;
const OUT_MS = 450;

const UpdateToast = () => {
    const screen = useSystemStore((s) => s.screen);
    const startTimeTravel = useSystemStore((s) => s.startTimeTravel);
    // "pending" → wait, "in" → showing, "out" → sliding away, "gone" → unmounted
    const [phase, setPhase] = useState("pending");

    useEffect(() => {
        if (screen !== "desktop") return;
        const t1 = setTimeout(() => setPhase("in"), APPEAR_DELAY_MS);
        const t2 = setTimeout(() => setPhase("out"), APPEAR_DELAY_MS + VISIBLE_MS);
        const t3 = setTimeout(() => setPhase("gone"), APPEAR_DELAY_MS + VISIBLE_MS + OUT_MS);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [screen]);

    if (phase === "pending" || phase === "gone" || screen !== "desktop") return null;

    const dismiss = () => {
        setPhase("out");
        setTimeout(() => setPhase("gone"), OUT_MS);
    };

    const install = () => {
        setPhase("out");
        startTimeTravel();
    };

    return (
        <div className={`update-toast ${phase === "out" ? "update-toast-out" : ""}`} role="alert">
            <div className="update-toast-bar">
                <span className="update-toast-title">✦ Adam Jemmali OS Update</span>
                <button type="button" className="update-toast-x" onClick={dismiss} aria-label="Dismiss">
                    ✕
                </button>
            </div>
            <div className="update-toast-body">
                <p>A newer build of this portfolio is available.</p>
                <p className="update-toast-strong">madaj.builds &rarr; 2026 Edition.</p>
                <button type="button" className="update-toast-install" onClick={install}>
                    Install update <RotateCw size={13} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

export default UpdateToast;

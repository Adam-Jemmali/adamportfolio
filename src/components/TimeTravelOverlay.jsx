import { useEffect, useState } from "react";
import Screensaver from "#components/Screensaver.jsx";

// Same domain, different build — this jumps out to a static page at
// /content/madajbuilds/ (see public/content/madajbuilds/index.html).
// The explicit "index.html" avoids relying on the host's directory-index
// fallback, which Vite's own dev server doesn't do for SPA routes either.
const REDIRECT_URL = "/content/madajbuilds/index.html";
const DURATION_MS = 2800;
const FLASH_AT_MS = DURATION_MS - 500;

const TimeTravelOverlay = () => {
    const [speed, setSpeed] = useState(0);
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        const start = performance.now();
        let raf;

        const tick = (now) => {
            const t = Math.min(1, (now - start) / FLASH_AT_MS);
            setSpeed(Math.round(t * 88 * 10) / 10);
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        const flashTimer = setTimeout(() => setFlash(true), FLASH_AT_MS);
        const redirectTimer = setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, DURATION_MS);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(flashTimer);
            clearTimeout(redirectTimer);
        };
    }, []);

    return (
        <div className={`time-travel-overlay ${flash ? "is-flashing" : ""}`}>
            <Screensaver module="warp" />

            <div className="time-travel-content">
                <svg className="time-travel-ring" viewBox="0 0 200 200" aria-hidden="true">
                    <circle cx="100" cy="100" r="86" className="time-travel-ring-track" />
                    <circle cx="100" cy="100" r="86" className="time-travel-ring-fill" />
                </svg>

                <h1 className="time-travel-title">Time Travel Engaged</h1>
                <p className="time-travel-sub">Jumping to another build&hellip;</p>

                <div className="time-travel-gauges">
                    <div className="time-travel-gauge">
                        <span className="time-travel-gauge-label">speed</span>
                        <span className="time-travel-gauge-value">
                            {speed.toFixed(1)} <small>mph</small>
                        </span>
                    </div>
                    <div className="time-travel-gauge">
                        <span className="time-travel-gauge-label">power</span>
                        <span className="time-travel-gauge-value">
                            1.21 <small>gigawatts</small>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeTravelOverlay;

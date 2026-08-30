import { useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import BrandName from "#components/BrandName.jsx";

const BOOT_LOGS = [
    { text: "Stretching the startup process", pct: 8 },
    { text: "Loading @AdamJemmali OS", pct: 44 },
    { text: "Hiding the bugs ", pct: 70 },
    { text: "Starting python virtual environment", pct: 92 },
];

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useGSAP(() => {
        const bootProgress = { v: 0 };
        const tl = gsap.timeline({ onComplete });

        // Progress bar (drives the boot logs and percentage readout).
        tl.to(bootProgress, {
            v: 100,
            duration: 3.6,
            ease: "power1.inOut",
            onUpdate: () => setProgress(Math.round(bootProgress.v)),
        }, 0);

        // A + J gravity-fall: drop in from above, spin a full 360°, fade in.
        tl.fromTo(
            ".boot-monograms .brand-monogram",
            { y: -window.innerHeight * 0.85, opacity: 0, rotation: 0, scale: 1.55 },
            { y: 0, opacity: 1, rotation: 360, scale: 1, duration: 2.2, ease: "bounce.out", stagger: 0.26 },
            0
        );

        // Fade in/out breath once the letters have landed.
        tl.to(
            ".boot-monograms .brand-monogram",
            { opacity: 0.4, duration: 0.45, yoyo: true, repeat: 1, ease: "sine.inOut" },
            2.35
        );

        // Exit fade — the whole boot screen (letters included) fades out.
        tl.to(".boot-screen", { opacity: 0, duration: 0.5, ease: "power2.in" }, 3.1);

        // Boot copy fades in under the falling letters.
        tl.fromTo(".boot-content", { opacity: 0 }, { opacity: 1, duration: 1.0 }, 0.5);
    }, []);

    return (
        <div className="boot-screen">
            <div className="boot-monograms" aria-hidden="true">
                <BrandName monogramsOnly />
            </div>

            <div className="boot-content flex flex-col items-center">
                <h1 className="boot-title">
                    <span className="boot-title-accent">A</span>dam <span className="boot-title-accent">J</span>emmali <span className="boot-title-accent">OS</span>
                </h1>

                <p className="boot-sub">Aspiring AI Engineer</p>

                <div className="boot-logs">
                    {BOOT_LOGS.map((log) =>
                        progress >= log.pct ? (
                            <div key={log.text} className="boot-log">
                                <span>{log.text}</span>
                            </div>
                        ) : null
                    )}
                </div>

                <div className="boot-bar">
                    <div className="boot-bar-track">
                        <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <p className="boot-status">
                    Loading...
                    <span className="boot-status-pct">{progress.toString().padStart(2, "0")}%</span>
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;

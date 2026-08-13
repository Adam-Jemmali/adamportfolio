import { useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BOOT_LOGS = [
    { text: "Stretching the CPUs…", pct: 8 },
    { text: "Brewing coffee for the GPU", pct: 18 },
    { text: "Waking up the pixels", pct: 30 },
    { text: "Loaded @madajbuilds OS v1.0", pct: 44 },
    { text: "Finding your open tabs", pct: 58 },
    { text: "Hiding the bugs 🐛", pct: 70 },
    { text: "Mounted user session", pct: 82 },
    { text: "Starting desktop environment", pct: 92 },
];

const LoadingScreen = ({ title = "System Initialize", onComplete }) => {
    const [progress, setProgress] = useState(0);

    useGSAP(() => {
        const tl = gsap.timeline({ onComplete });
        tl.to({}, {
            duration: 2.8,
            ease: "power1.inOut",
            onUpdate: () => setProgress(Math.round(tl.progress() * 100)),
        });

        gsap.fromTo(".boot-logo",
            { scale: 0.4, opacity: 0, rotate: -30 },
            { scale: 1, opacity: 1, rotate: 0, duration: 1.1, ease: "elastic.out(1, 0.7)" }
        );

        gsap.fromTo(".boot-content",
            { opacity: 0 },
            { opacity: 1, duration: 0.6, delay: 0.3 }
        );
    }, []);

    return (
        <div className="boot-screen">
            <div className="boot-logo lock-initials !size-20 text-3xl">M. J</div>

            <div className="boot-content flex flex-col items-center">
                <div className="boot-spinner" />

                <div className="boot-logs">
                    {BOOT_LOGS.map((log) =>
                        progress >= log.pct ? (
                            <div key={log.text} className="boot-log">
                                <span>{log.text}</span>
                                <span className="boot-ok">
                                    <span className="boot-check">
                                        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2 6.5l2.5 2.5L10 3.5" />
                                        </svg>
                                    </span>
                                    okay
                                </span>
                            </div>
                        ) : null
                    )}
                </div>

                <div className="boot-bar">
                    <div className="boot-bar-track">
                        <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <p className="mt-6 text-white/40 text-[11px] tracking-[0.3em] font-medium uppercase">
                    {title}
                    <span className="ml-2 font-mono normal-case tracking-normal text-white/60">
                        {progress.toString().padStart(2, "0")}%
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;

import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import useTourStore from "#store/tour.js";
import TrappieLogo from "#components/TrappieLogo.jsx";

// Trappie's guided tour of the OS. Each step points at a real UI element (or
// centers the card for the outro) and the overlay dims everything else.
const STEPS = [
    {
        id: "welcome",
        target: "#welcome .hero-title",
        placement: "bottom",
        title: "Welcome to Adam Jemmali OS",
        body: "Hey, I'm Trappie — your tour guide. This is a desktop you can click, drag and open things in.",
    },
    {
        id: "contact",
        target: "#welcome .hero-cta-secondary",
        placement: "bottom",
        title: "Get in touch",
        body: "Ready to say hi? This button opens the contact window.",
    },
    {
        id: "topbar",
        target: "#topbar",
        placement: "bottom",
        title: "The top bar",
        body: "Wi-Fi, sound, brightness, profile and the power menu live up here.",
    },
    {
        id: "desktop",
        target: "#home .desktop-item",
        placement: "right",
        title: "Desktop icons",
        body: "Double-click an icon to open an app, or right-click the wallpaper to change it.",
    },
    {
        id: "dock",
        target: "#dock",
        placement: "top",
        title: "The dock",
        body: "Launch every app from here — and find me whenever you're lost.",
    },
    {
        id: "done",
        target: null,
        placement: "center",
        title: "You're all set!",
        body: "Explore, drag windows around, play a game. Tap my dock icon any time for another tour.",
    },
];

const PAD = 18;
const SPOT_MARGIN = 8;

const TourGuide = () => {
    const active = useTourStore((s) => s.active);
    const step = useTourStore((s) => s.step);
    const next = useTourStore((s) => s.next);
    const back = useTourStore((s) => s.back);
    const end = useTourStore((s) => s.end);

    const tooltipRef = useRef(null);
    const [layout, setLayout] = useState(null);

    const stepDef = STEPS[Math.min(step, STEPS.length - 1)];
    const isLast = step >= STEPS.length - 1;

    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

    const computeLayout = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const tw = tooltipRef.current?.offsetWidth || 320;
        const th = tooltipRef.current?.offsetHeight || 160;

        const target = stepDef.target ? document.querySelector(stepDef.target) : null;
        const rect = target ? target.getBoundingClientRect() : null;

        if (!rect) {
            return {
                spot: null,
                tip: { left: vw / 2, top: vh / 2, arrow: "none", centered: true },
            };
        }

        const spot = {
            top: rect.top - SPOT_MARGIN,
            left: rect.left - SPOT_MARGIN,
            width: rect.width + SPOT_MARGIN * 2,
            height: rect.height + SPOT_MARGIN * 2,
        };

        const place = stepDef.placement || "bottom";
        const fitsBelow = rect.bottom + PAD + th <= vh - PAD;
        const fitsAbove = rect.top - PAD - th >= PAD;
        let left;
        let top;
        let arrow = "top";

        if (place === "right" || place === "left") {
            top = rect.top + rect.height / 2 - th / 2;
            if (place === "right") {
                left = rect.right + PAD;
                arrow = "left";
                if (left + tw > vw - PAD) {
                    left = rect.left - tw - PAD;
                    arrow = "right";
                }
            } else {
                left = rect.left - tw - PAD;
                arrow = "right";
                if (left < PAD) {
                    left = rect.right + PAD;
                    arrow = "left";
                }
            }
        } else if (place === "top") {
            left = rect.left + rect.width / 2 - tw / 2;
            if (fitsAbove) {
                top = rect.top - th - PAD;
                arrow = "bottom";
            } else if (fitsBelow) {
                top = rect.bottom + PAD;
                arrow = "top";
            } else {
                top = vh - th - PAD;
                arrow = "top";
            }
        } else {
            left = rect.left + rect.width / 2 - tw / 2;
            if (fitsBelow) {
                top = rect.bottom + PAD;
                arrow = "top";
            } else if (fitsAbove) {
                top = rect.top - th - PAD;
                arrow = "bottom";
            } else {
                top = vh - th - PAD;
                arrow = "top";
            }
        }

        left = clamp(left, PAD, vw - tw - PAD);
        top = clamp(top, PAD, Math.max(vh - th - PAD, PAD));

        return { spot, tip: { left, top, arrow, centered: false } };
    };

    useLayoutEffect(() => {
        if (!active) return;
        const compute = () => setLayout(computeLayout());
        compute();
        window.addEventListener("resize", compute);
        return () => window.removeEventListener("resize", compute);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, step]);

    // Keyboard shortcuts: Esc exits, arrows move through the steps.
    useEffect(() => {
        if (!active) return;
        const onKey = (e) => {
            if (e.key === "Escape") end();
            else if (e.key === "ArrowRight") (isLast ? end : next)();
            else if (e.key === "ArrowLeft" && step > 0) back();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [active, step, isLast, next, back, end]);

    if (!active) return null;

    const advance = () => (isLast ? end() : next());
    const spot = layout?.spot;
    const tip = layout?.tip;

    return (
        <>
            <div className="tour-backdrop" data-dim={!spot} onClick={advance} aria-hidden="true" />

            {spot && (
                <div
                    className="tour-spotlight"
                    style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
                    aria-hidden="true"
                />
            )}
            {spot && (
                <div
                    className="tour-spotlight-ring"
                    style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
                    aria-hidden="true"
                />
            )}

            <div
                ref={tooltipRef}
                className={`tour-tooltip ${tip ? "is-visible" : ""} ${tip?.centered ? "centered" : ""}`}
                style={tip ? { top: tip.top, left: tip.left } : { top: -9999, left: -9999 }}
                role="dialog"
                aria-label="Trappie tour"
                aria-live="polite"
            >
                <span className={`tour-arrow ${tip?.arrow || "none"}`} aria-hidden="true" />
                <div className="tour-tooltip-head">
                    <span className="tour-avatar">
                        <TrappieLogo size={48} />
                    </span>
                    <div className="min-w-0">
                        <p className="tour-guide-name">Trappie</p>
                        <p className="tour-guide-role">Your OS tour guide</p>
                    </div>
                </div>
                <h3 className="tour-tip-title">{stepDef.title}</h3>
                <p className="tour-tip-body">{stepDef.body}</p>
                <div className="tour-tip-foot">
                    <div className="tour-dots">
                        {STEPS.map((s, i) => (
                            <span key={s.id} className={`tour-dot ${i === step ? "active" : ""}`} />
                        ))}
                    </div>
                    <div className="tour-actions">
                        <button type="button" className="tour-btn ghost" onClick={end}>
                            <X size={14} />
                            Skip
                        </button>
                        <button type="button" className="tour-btn ghost" onClick={back} disabled={step === 0}>
                            <ArrowLeft size={14} />
                            Back
                        </button>
                        <button type="button" className="tour-btn primary" onClick={advance}>
                            {isLast ? "Finish" : "Next"}
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TourGuide;

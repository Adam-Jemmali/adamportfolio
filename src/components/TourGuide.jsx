import { useLayoutEffect, useRef, useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, X, Monitor, Mail, Wifi, Folder, PanelsTopLeft, PartyPopper, Volume2, VolumeX } from "lucide-react";
import useTourStore from "#store/tour.js";
import TrappieLogo from "#components/TrappieLogo.jsx";
import { setSoundMuted, getStoredMute, playTick, playChirp, playWhoosh } from "#utils/sound.js";

// Trappie's guided tour of the OS. Each step points at a real UI element (or
// centers the card for the outro) and the overlay dims everything else.
const STEPS = [
    {
        id: "welcome",
        target: "#welcome .hero-title",
        placement: "bottom",
        mascot: "target",
        icon: Monitor,
        title: "Welcome to Adam Jemmali OS",
        body: "Hey, I'm Trappie, your tour guide. This is a desktop you can click, drag and open things in.",
    },
    {
        id: "contact",
        target: "#welcome .hero-cta-secondary",
        placement: "bottom",
        icon: Mail,
        title: "Get in touch",
        body: "Ready to say hi? This button opens the contact window.",
    },
    {
        id: "topbar",
        target: "#topbar",
        placement: "bottom",
        icon: Wifi,
        title: "The top bar",
        body: "Wi-Fi, sound, brightness, profile and the power menu live up here.",
    },
    {
        id: "desktop",
        target: "#home .desktop-item",
        placement: "right",
        icon: Folder,
        title: "Desktop icons",
        body: "Double-click an icon to open an app, or right-click the wallpaper to change it.",
    },
    {
        id: "dock",
        target: "#dock",
        placement: "top",
        icon: PanelsTopLeft,
        title: "The dock",
        body: "Launch every app from here. Find me whenever you're lost.",
    },
    {
        id: "done",
        target: null,
        placement: "center",
        icon: PartyPopper,
        title: "You're all set!",
        body: "Explore, drag windows around, play a game. Tap my dock icon any time for another tour.",
    },
];

const PAD = 18;
const SPOT_MARGIN = 8;
const MASCOT_SIZE = 168;
const MASCOT_GAP = 12;
const MASCOT_PEEK = 56;

const CONFETTI_COLORS = ["#22d3ee", "#a3e635", "#f472b6", "#fbbf24", "#ffffff", "#4ade80"];
const CONFETTI_COUNT = 18;

const TourGuide = () => {
    const active = useTourStore((s) => s.active);
    const step = useTourStore((s) => s.step);
    const next = useTourStore((s) => s.next);
    const back = useTourStore((s) => s.back);
    const end = useTourStore((s) => s.end);

    const tooltipRef = useRef(null);
    const mascotRef = useRef(null);
    const [layout, setLayout] = useState(null);
    const [wink, setWink] = useState(0);
    const [hopKey, setHopKey] = useState(0);
    const [muted, setMuted] = useState(getStoredMute);
    const [windDirection, setWindDirection] = useState(1);
    const prevStepRef = useRef(null);

    useEffect(() => {
        setSoundMuted(muted);
        try {
            localStorage.setItem("trappie-sounds-muted", muted ? "1" : "0");
        } catch {
            // Storage unavailable — the mute preference just won't persist.
        }
    }, [muted]);

    const stepDef = STEPS[Math.min(step, STEPS.length - 1)];
    const isLast = step >= STEPS.length - 1;

    const advance = useCallback(() => {
        if (isLast) {
            end();
            return;
        }
        if (step === 0) setHopKey((k) => k + 1);
        // Flip the confetti wind each time we cross into the outro.
        if (step === STEPS.length - 2) setWindDirection((d) => -d);
        setWink((w) => w + 1);
        next();
    }, [isLast, step, end, next]);

    const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

    const computeLayout = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const tw = tooltipRef.current?.offsetWidth || 320;
        const th = tooltipRef.current?.offsetHeight || 160;

        // Trappie is a free-floating mascot. For the welcome step he sits above
        // the hero logo; everywhere else he stands beside the speech bubble on
        // whichever side has room.
        const computeMascot = (targetRect, tipLeft, tipTop, tw, th) => {
            const maxLeft = Math.max(PAD, vw - MASCOT_SIZE - PAD);
            const maxTop = Math.max(PAD, vh - MASCOT_SIZE - PAD);

            let mascotLeft;
            let mascotTop;

            if (stepDef.mascot === "target" && targetRect) {
                mascotLeft = targetRect.left + targetRect.width / 2 - MASCOT_SIZE / 2;
                // Let his lower body tuck behind the top edge of the logo so he
                // reads as peeking over it instead of hovering above it.
                mascotTop = targetRect.top + MASCOT_PEEK - MASCOT_SIZE;
            } else {
                const fitsRight = tipLeft + tw + MASCOT_GAP + MASCOT_SIZE <= vw - PAD;
                const fitsLeft = tipLeft - MASCOT_GAP - MASCOT_SIZE >= PAD;
                const side = fitsRight || !fitsLeft ? "right" : "left";
                mascotLeft = side === "right"
                    ? tipLeft + tw + MASCOT_GAP
                    : tipLeft - MASCOT_GAP - MASCOT_SIZE;
                mascotTop = tipTop + th / 2 - MASCOT_SIZE / 2;
            }

            return {
                left: clamp(mascotLeft, PAD, maxLeft),
                top: clamp(mascotTop, PAD, maxTop),
            };
        };

        const target = stepDef.target ? document.querySelector(stepDef.target) : null;
        const rect = target ? target.getBoundingClientRect() : null;

        if (!rect) {
            return {
                spot: null,
                tip: { left: vw / 2, top: vh / 2, arrow: "none", centered: true },
                mascot: computeMascot(null, vw / 2, vh / 2, tw, th),
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

        return {
            spot,
            tip: { left, top, arrow, centered: false },
            mascot: computeMascot(rect, left, top, tw, th),
        };
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
            else if (e.key === "ArrowRight") advance();
            else if (e.key === "ArrowLeft" && step > 0) back();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [active, step, advance, back, end]);

    // Soft tick whenever the tooltip advances to a new step (icon pop-in).
    useEffect(() => {
        if (!active) {
            prevStepRef.current = null;
            return;
        }
        if (prevStepRef.current !== step) {
            playTick();
            prevStepRef.current = step;
        }
    }, [active, step]);

    // Leaving the welcome step: Trappie hops from above the logo down beside
    // the bubble instead of sliding there in a straight line.
    useEffect(() => {
        if (!hopKey) return;
        playWhoosh();
        const el = mascotRef.current;
        if (!el) return;

        el.animate(
            [
                { transform: "translateY(0) scale(1, 1)", offset: 0 },
                { transform: "translateY(-46px) scale(1.04, 0.94)", offset: 0.28 },
                { transform: "translateY(-14px) scale(0.97, 1.03)", offset: 0.6 },
                { transform: "translateY(4px) scale(1.02, 0.98)", offset: 0.82 },
                { transform: "translateY(0) scale(1, 1)", offset: 1 },
            ],
            { duration: 760, easing: "ease-out" }
        );
    }, [hopKey]);

    // A tiny celebratory hop when Trappie's happy squint fires on the outro.
    useEffect(() => {
        if (!isLast) return;
        playChirp();
        const el = mascotRef.current;
        if (!el) return;

        el.animate(
            [
                { transform: "translateY(0) scale(1, 1)", offset: 0 },
                { transform: "translateY(-16px) scale(1.03, 0.97)", offset: 0.35 },
                { transform: "translateY(0) scale(1.05, 0.95)", offset: 0.7 },
                { transform: "translateY(0) scale(1, 1)", offset: 1 },
            ],
            { duration: 620, easing: "ease-out" }
        );
    }, [isLast]);

    if (!active) return null;

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

            <div
                ref={tooltipRef}
                className={`tour-tooltip ${tip ? "is-visible" : ""} ${tip?.centered ? "centered" : ""}`}
                style={tip ? { top: tip.top, left: tip.left } : { top: -9999, left: -9999 }}
                role="dialog"
                aria-label="Trappie tour"
                aria-live="polite"
            >
                <span className={`tour-arrow ${tip?.arrow || "none"}`} aria-hidden="true" />
                <div className="tour-tip-head">
                    <span key={step} className="tour-tip-icon" aria-hidden="true">
                        <stepDef.icon size={18} />
                        {isLast && (
                            <span className="tour-confetti" aria-hidden="true">
                                {Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
                                    const angle = (i / CONFETTI_COUNT) * Math.PI * 2;
                                    const dist = 20 + (i % 4) * 5;
                                    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
                                    const spin = (i % 2 ? 1 : -1) * (160 + ((i * 53) % 200));
                                    const fall = 16 + (i % 5) * 6;
                                    const drift = windDirection * (12 + (i % 3) * 4);
                                    return (
                                        <i
                                            key={i}
                                            style={{
                                                "--c": color,
                                                "--dx": `${(Math.cos(angle) * dist).toFixed(1)}px`,
                                                "--dy": `${(Math.sin(angle) * dist).toFixed(1)}px`,
                                                "--rot": `${spin}deg`,
                                                "--fall": `${fall}px`,
                                                "--drift": `${drift}px`,
                                            }}
                                        />
                                    );
                                })}
                            </span>
                        )}
                    </span>
                    <h3 className="tour-tip-title">{stepDef.title}</h3>
                </div>
                <p className="tour-tip-body">{stepDef.body}</p>
                <div className="tour-tip-foot">
                    <div className="tour-dots">
                        {STEPS.map((s, i) => (
                            <span key={s.id} className={`tour-dot ${i === step ? "active" : ""}`} />
                        ))}
                    </div>
                    <div className="tour-actions">
                        <button
                            type="button"
                            className={`tour-btn ghost icon ${muted ? "is-muted" : ""}`}
                            onClick={() => setMuted((m) => !m)}
                            aria-label={muted ? "Unmute tour sounds" : "Mute tour sounds"}
                            aria-pressed={muted}
                            title={muted ? "Unmute tour sounds" : "Mute tour sounds"}
                        >
                            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
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

            {layout?.mascot && (
                <div
                    ref={mascotRef}
                    className="tour-mascot"
                    style={{ top: layout.mascot.top, left: layout.mascot.left }}
                    aria-hidden="true"
                >
                    <TrappieLogo size={MASCOT_SIZE} className="tour-mascot-float" wink={wink} happy={isLast} />
                    <div className="tour-mascot-caption">
                        <p className="tour-mascot-name">Trappie</p>
                        <p className="tour-mascot-role">Your OS tour guide</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default TourGuide;

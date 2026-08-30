import React, { useRef, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ExternalLink, Rocket } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import WindowsControls from "#components/WindowsControls.jsx";
import { Pigeon } from "#components/AppMascots.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import BrandName from "#components/BrandName.jsx";
import { socials } from "#constants/index.js";

const CAL_URL = "https://cal.com/madaj/15meeting";

const QUESTIONS = [
    {
        id: "goal",
        prompt: "What brings you here?",
        options: ["Sports tech", "Agentic AI", "EdTech / tutoring", "Something else"],
    },
    {
        id: "stage",
        prompt: "Where are you right now?",
        options: ["Just exploring", "Have an idea", "Ready to build", "Hiring / partnering"],
    },
    {
        id: "timeline",
        prompt: "What's your timeline?",
        options: ["ASAP", "This month", "Next quarter", "No rush"],
    },
    {
        id: "focus",
        prompt: "What should we dig into?",
        options: ["Tech & architecture", "Strategy & roadmap", "AI / CV in sports", "A 15 min conversation"],
    },
];

const PARTICLES = Array.from({ length: 56 }, (_, i) => ({
    id: i,
    color: ["#4bd5ea", "#f472b6", "#fbbf24", "#4ade80", "#a78bfa"][i % 5],
    angle: (i / 56) * Math.PI * 2,
    dist: 110 + (i % 7) * 38,
}));

const Contact = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [launching, setLaunching] = useState(false);
    const [launched, setLaunched] = useState(false);
    const overlayRef = useRef(null);

    const isLaunch = step >= QUESTIONS.length;
    const current = QUESTIONS[step];

    useGSAP(() => {
        if (!launching || !overlayRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".cal-ring",
                { scale: 0, opacity: 0.9 },
                { scale: 7, opacity: 0, duration: 1.15, ease: "power3.out", stagger: 0.16 }
            );
            gsap.fromTo(
                ".cal-rocket",
                { scale: 0, rotate: -20 },
                { scale: 1, rotate: 0, duration: 0.6, ease: "back.out(2)" }
            );
            gsap.fromTo(
                ".cal-copy",
                { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.5, delay: 0.25 }
            );

            PARTICLES.forEach((p, i) => {
                const el = overlayRef.current.querySelectorAll(".cal-particle")[i];
                if (!el) return;
                const tx = Math.cos(p.angle) * p.dist;
                const ty = Math.sin(p.angle) * p.dist;
                gsap.fromTo(
                    el,
                    { x: 0, y: 0, scale: 1, opacity: 1 },
                    { x: tx, y: ty, scale: 0, opacity: 0, duration: 1.15, ease: "power2.out", delay: 0.05 }
                );
            });
        }, overlayRef);

        return () => ctx.revert();
    }, [launching]);

    const pick = (option) => {
        setAnswers((a) => ({ ...a, [current.id]: option }));
        setStep((s) => s + 1);
    };

    const back = () => setStep((s) => Math.max(0, s - 1));

    const launch = () => {
        setLaunched(true);
        setLaunching(true);
        window.open(CAL_URL, "_blank", "noopener,noreferrer");
        setTimeout(() => setLaunching(false), 1900);
    };

    return (
        <>
            <div id="window-header">
                <WindowsControls target="contact" />
                <h2><Pigeon />Contact &amp; Booking</h2>
            </div>

            <div className="contact-layout">
                <section className="contact-intro">
                    <div className="lock-initials size-16! text-xl">
                        <BrandName monogramsOnly />
                    </div>
                    <h3>Let's build something.</h3>
                    <p className="contact-tagline">
                        Building ML systems &amp; AI automation, open to sports tech, agentic AI
                        and EdTech conversations.
                    </p>

                    <ul className="contact-socials">
                        {socials.map(({ id, text, icon, bg, link }) => (
                            <li key={id}>
                                <a href={link} target="_blank" rel="noopener" title={text} style={{ backgroundColor: bg }}>
                                    <img src={icon} alt={text} />
                                    <span>{text}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="booking">
                    {!isLaunch ? (
                        <div className="quiz">
                            <div className="quiz-top">
                                <span className="quiz-step">Step {step + 1} / {QUESTIONS.length}</span>
                                <button type="button" className="quiz-back" onClick={back} disabled={step === 0}>
                                    <ChevronLeft size={14} />
                                    Back
                                </button>
                            </div>

                            <div className="quiz-track">
                                <div className="quiz-fill" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
                            </div>

                            <h4 className="quiz-prompt">{current.prompt}</h4>

                            <div className="quiz-options">
                                {current.options.map((opt) => (
                                    <button key={opt} type="button" className="quiz-option" onClick={() => pick(opt)}>
                                        <span>{opt}</span>
                                        <ArrowRight size={15} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="quiz-done">
                            <span className="booking-check"><Check size={20} /></span>
                            <h4>You're all set.</h4>
                            <p className="quiz-summary">
                                {answers.goal} & {answers.timeline}
                            </p>
                            {launched ? (
                                <a href={CAL_URL} target="_blank" rel="noopener" className="booking-cal">
                                    Reopen cal.com
                                    <ExternalLink size={14} />
                                </a>
                            ) : (
                                <button type="button" className="booking-cal" onClick={launch}>
                                     
                                    Let's discuss!
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {launching && (
                <div ref={overlayRef} className="cal-overlay">
                    {PARTICLES.map((p) => (
                        <span key={p.id} className="cal-particle" style={{ background: p.color }} />
                    ))}
                    <span className="cal-ring" />
                    <span className="cal-ring" />
                    <span className="cal-ring" />
                    <div className="cal-rocket"><Rocket size={34} /></div>
                    <p className="cal-copy">Opening your cal.com…</p>
                    <a href={CAL_URL} target="_blank" rel="noopener" className="cal-fallback">
                        Didn't open? Tap here
                        <ExternalLink size={13} />
                    </a>
                </div>
            )}
        </>
    );
};

const ContactWindow = WindowWrapper(Contact, 'contact');
export default ContactWindow;

import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ── Work experience, chronological (oldest first) ─────────────────────── */
const WORK_EXPERIENCE = [
    {
        id: "sportlogiq",
        type: "work",
        logo: "public/images/sportlogiq.jpg",
        logoAlt: "Sportlogiq logo",
        tag: "Computer Vision & ML Developer Intern",
        title: "Sportlogiq",
        period: "May 2024 – Aug 2024",
        year: "2024",
        location: "Montreal, QC · On-site",
        summary:
            "Built real-time soccer tracking and event detection from broadcast video.",
        bullets: [
            "Designed a soccer performance analytics pipeline for single-camera Canadian Premier League (CPL) broadcast feeds, transforming raw video into spatio-temporal tracking data and physical load metrics.",
            "Engineered and deployed a low-latency soccer event-detection engine achieving 92% accuracy at 30 FPS with under 100ms CPU inference, using OpenCV and PyTorch optimized for edge and serverless video processing.",
            "Developed kinematic performance models in NumPy and TensorFlow to extract player sprint dynamics, acceleration profiles, and high-intensity running thresholds without relying on GPS sensors.",
            "Built high-throughput FastAPI and WebSocket streaming microservices pushing real-time tracking data and tactical analytics (pressing intensity, pitch control) to a React frontend, reducing analyst review time by 30%.",
            "Maintained a fault-tolerant ingestion-to-inference pipeline with CI/CD and automated event tagging to support live match analysis across a full season.",
        ],
        skills: ["OpenCV", "PyTorch", "NumPy", "TensorFlow", "FastAPI", "WebSockets", "React", "CI/CD"],
    },
    {
        id: "upwork",
        type: "work",
        logo: "public/images/Upwork-New-Logo.png",
        logoAlt: "Upwork logo",
        tag: "Freelance AI Automation Specialist",
        title: "Upwork",
        period: "May 2024 – Nov 2025",
        year: "2024",
        location: "Remote · 7 clients across education, recruiting, and real estate",
        summary:
            "Automated lead and CRM workflows for B2B clients using AI and no-code tools.",
        bullets: [
            "Engineered AI-driven workflow automations for B2B clients, primarily in real estate, using Make.com, Zapier, and Monday.com, increasing lead conversion by 35%.",
            "Designed event-triggered CRM automations that achieved a 40% client ROI within two months of deployment.",
            "Reduced manual operations by over 20 hours per week per client through scalable no-code workflow architecture.",
        ],
        skills: ["Make.com", "Zapier", "Monday.com", "CRM Automation", "AI Workflows"],
    },
    {
        id: "uo-ai-society",
        type: "work",
        logo: "public/images/universityai+society.png",
        logoAlt: "University of Ottawa AI+ Society logo",
        tag: "Distributed Systems Developer",
        title: "University of Ottawa AI+ Society",
        period: "Oct 2025 – Jan 2026",
        year: "2025",
        location: "Ottawa, ON · Event-driven backend infrastructure for a 3-person Agile team",
        summary:
            "Helped replace polling with event-driven backend infrastructure for a three-person team.",
        bullets: [
            "Replaced a synchronous polling architecture with RabbitMQ async message queues, decoupling producers from consumers and enabling backpressure-controlled throughput scaling.",
            "Implemented GitHub Actions CI/CD with automated unit-testing gates and tagged release management, contributing as a backend developer using object-oriented design patterns in a collaborative Git-managed repository.",
        ],
        skills: ["RabbitMQ", "GitHub Actions", "CI/CD", "Agile/Scrum", "Git"],
    },
    {
        id: "mentrixa",
        type: "work",
        logo: "public/images/mentrixa.png",
        logoAlt: "Mentrixa logo",
        tag: "Ex-Founder",
        title: "Mentrixa",
        period: "Feb 2026 – Aug 2026",
        year: "2026",
        location: "Ottawa, ON · Self-employed · Remote",
        summary:
            "Co-founded an EdTech SaaS for recording and practicing verifiable skills.",
        bullets: [
            "Co-built a full-stack platform (Next.js 14 App Router, TypeScript, Supabase/Postgres) with a collaborator for recording verifiable first-attempt skill performance across academic and applied subjects.",
            "Planned system architecture with UML class and sequence diagrams before implementation, mapping the auth, quest, and video-recording flows.",
            "Engineered a live video capture and recording pipeline using WebRTC and the MediaRecorder API, with Supabase Realtime handling signaling and Supabase Storage persisting recordings.",
            "Implemented authentication and session architecture (Supabase Auth with JWT metadata) and a gamified quest system to structure the recording flow.",
            "Onboarded 28 users and 1 tutor/guide; identified user acquisition as the core unresolved bottleneck and made the decision to shut the product down after 8 months rather than continue without validated demand.",
        ],
        skills: ["Next.js 14", "TypeScript", "Supabase", "Postgres", "WebRTC", "MediaRecorder API"],
    },
];

/* ── Group work entries by start year and assign alternating sides ─────── */
const WORK_GROUPS = (() => {
    const groups = [];
    let index = 0;
    for (const entry of WORK_EXPERIENCE) {
        const last = groups[groups.length - 1];
        if (!last || last.year !== entry.year) {
            groups.push({ year: entry.year, entries: [] });
        }
        groups[groups.length - 1].entries.push({
            ...entry,
            side: index % 2 === 0 ? "left" : "right",
            showLine: index < WORK_EXPERIENCE.length - 1,
        });
        index += 1;
    }
    return groups;
})();

const YEARS = WORK_GROUPS.map((group) => group.year);

/* ── Education, certifications, awards, and current focus ───────────────── */
const SUPPORTING_ENTRIES = [
    {
        id: "education",
        type: "education",
        logo: "public/images/uo.png",
        logoAlt: "University of Ottawa logo",
        tag: "Education",
        title: "University of Ottawa",
        subtitle: "Honours Bachelor of Engineering, Computer Science",
        period: "Sep 2024 – Apr 2028",
        location: "Ottawa, ON · GPA: 3.6/4.0",
        bullets: [
            "Relevant coursework: Machine Learning, Computer Vision, Algorithms and Data Structures, Operating Systems, Database Systems, Object-Oriented Software Engineering.",
            "68 verified NeetCode DSA submissions spanning arrays, graphs, dynamic programming, and trees, maintained through ongoing daily algorithmic practice.",
            "Eligible for Government of Canada security clearance.",
        ],
    },
    {
        id: "certifications",
        type: "achievement",
        icon: "/public/icons/trophy.svg",
        tag: "Certifications",
        title: "Certifications & Learning",
        certs: [
            {
                icon: "public/images/aifundamentalsofmachinelearningandai.jpg",
                name: "AWS Fundamentals of Machine Learning and Artificial Intelligence",
                meta: "Amazon Web Services: Oct 2025",
            },
            {
                icon: "public/images/kaggle.png",
                name: "Intro to Machine Learning (scikit-learn, Random Forest, model evaluation)",
                meta: "Kaggle: Nov 2025",
            },
            {
                icon: "public/images/githubcertificate.jpg",
                name: "Career Essentials in GitHub Professional Certificate",
                meta: "GitHub: Aug 2026",
            },
            {
                icon: "public/images/githubactioncert.jpg",
                name: "Practical GitHub Actions",
                meta: "LinkedIn Learning: Feb 2026",
            },
            {
                icon: "public/images/awscloudpract.webp",
                name: "AWS Cloud Practitioner",
                meta: "Amazon Web Services: In Progress 2026",
            },
            {
                icon: "public/images/dockercert.jpg",
                name: "Docker and DevOps Fundamentals",
                meta: "In Progress 2026",
            },
        ],
    },
    {
        id: "awards",
        type: "achievement",
        icon: "/public/icons/trophy.svg",
        tag: "Awards & Recognition",
        title: "Recognition",
        awards: [
            {
                icons: ["public/images/snowflake-logo.png", "public/images/mlh-logo.png", "public/images/hackconcordia.png"],
                title: "Best Use of Snowflake API",
                meta: "Invest Ottawa Hackathon 2026 · Chronos Cloud",
            },
            {
                icons: ["public/images/uo.png"],
                title: "Faculty of Science Achievement Award",
                meta: "University of Ottawa · 2024–2025",
            },
        ],
    },
    {
        id: "focus",
        type: "focus",
        icon: "/public/icons/gicon2.svg",
        tag: "Focus now",
        title: "Agentic AI & Computer Vision",
        period: "Building in public",
        summary:
            "Designing real-time sports analytics and computer vision pipelines alongside agentic AI systems.",
        skills: ["DSA (NeetCode)", "Linux debugging (SadServers)", "Shell tools", "Git internals", "MIT Missing Semester", "SQLZoo"],
    },
];

const JourneyWorkEntry = ({ entry }) => (
    <article className={`journey-entry journey-entry--${entry.side}`}>
        <div className="journey-spine" aria-hidden="true">
            <span className="journey-dot">
                {entry.logo ? (
                    <img
                        className={`journey-logo${entry.id === "uo-ai-society" ? " journey-logo--white" : ""}`}
                        src={entry.logo}
                        alt=""
                    />
                ) : (
                    <img src={entry.icon} alt="" />
                )}
            </span>
            {entry.showLine && <span className="journey-line" />}
        </div>

        <div className={`journey-entry-content journey-entry-content--${entry.side}`}>
            <div className="journey-card-topline">
                <span className="journey-role">{entry.tag}</span>
                <span className="journey-period">{entry.period}</span>
            </div>
            <h3>{entry.title}</h3>
            {entry.location && <p className="journey-location">{entry.location}</p>}
            <p className="journey-summary">{entry.summary}</p>
            {entry.skills && (
                <p className="journey-skills" aria-label={`${entry.title} technologies`}>{entry.skills.slice(0, 4).join("  ·  ")}</p>
            )}
        </div>
    </article>
);

const SupportingEntry = ({ entry }) => (
    <article className={`journey-support journey-support-${entry.type}`}>
        {(entry.logo || entry.icon) && (
            <div className="journey-support-icon">
                <img className={entry.logo ? "journey-logo" : ""} src={entry.logo || entry.icon} alt="" />
            </div>
        )}
        <div className="journey-card-topline">
            <span className="journey-role">{entry.tag}</span>
            {entry.period && <span className="journey-period">{entry.period}</span>}
        </div>
        <h3>{entry.title}</h3>
        {entry.subtitle && <p className="journey-subtitle">{entry.subtitle}</p>}
        {entry.location && <p className="journey-location">{entry.location}</p>}
        {entry.summary && <p className="journey-summary">{entry.summary}</p>}

        {entry.certs && (
            <ul className="journey-certs">
                {entry.certs.map((cert) => (
                    <li key={cert.name}>
                        <img className="journey-cert-icon" src={cert.icon} alt="" />
                        <span className="journey-cert-body">
                            <span className="journey-cert-name">{cert.name}</span>
                            <span className="journey-cert-meta">{cert.meta}</span>
                        </span>
                    </li>
                ))}
            </ul>
        )}

        {entry.awards && (
            <ul className="journey-awards">
                {entry.awards.map((award) => (
                    <li key={award.title}>
                        <span className="journey-award-icons" aria-hidden="true">
                            {award.icons.map((icon) => <img key={icon} src={icon} alt="" />)}
                        </span>
                        <span className="journey-cert-body">
                            <span className="journey-cert-name">{award.title}</span>
                            <span className="journey-cert-meta">{award.meta}</span>
                        </span>
                    </li>
                ))}
            </ul>
        )}

        {entry.skills && (
            <p className="journey-skills" aria-label={`${entry.title} technologies`}>{entry.skills.slice(0, 5).join("  ·  ")}</p>
        )}
    </article>
);

const Journey = () => {
    const bodyRef = useRef(null);
    const [activeYear, setActiveYear] = useState(YEARS[0]);

    useEffect(() => {
        const container = bodyRef.current;
        if (!container) return;

        const dividers = Array.from(container.querySelectorAll(".journey-year-divider"));
        const onScroll = () => {
            const top = container.getBoundingClientRect().top;
            let current = YEARS[0];
            for (const divider of dividers) {
                if (divider.getBoundingClientRect().top - top <= 48) {
                    current = divider.dataset.year;
                }
            }
            setActiveYear(current);
        };

        onScroll();
        container.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            container.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    const scrollToYear = (year) => {
        const container = bodyRef.current;
        if (!container) return;
        const target = container.querySelector(`.journey-year-divider[data-year="${year}"]`);
        if (!target) return;
        const delta = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
        container.scrollTo({ top: container.scrollTop + delta - 12, behavior: "smooth" });
    };

    useGSAP(() => {
        if (!bodyRef.current) return;

        const ctx = gsap.context(() => {
            // Intro staggers in on open.
            gsap.fromTo(
                ".journey-intro > *",
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }
            );

            // The content enters softly; the timeline remains visually quiet.
            ScrollTrigger.batch([".journey-year-divider", ".journey-support"], {
                scroller: bodyRef.current,
                start: "top 90%",
                once: true,
                onEnter: (batch) =>
                    gsap.fromTo(
                        batch,
                        { opacity: 0, y: 30 },
                        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", overwrite: true, clearProps: "transform" }
                    ),
            });

            // Work entries slide in from their side of the timeline.
            bodyRef.current
                .querySelectorAll(".journey-entry-content--left, .journey-entry-content--right")
                .forEach((card) => {
                    const isRight = card.classList.contains("journey-entry-content--right");
                    gsap.fromTo(
                        card,
                        { opacity: 0, x: isRight ? 72 : -72, y: 28 },
                        {
                            opacity: 1,
                            x: 0,
                            y: 0,
                            duration: 0.9,
                            ease: "power3.out",
                            clearProps: "opacity,transform",
                            scrollTrigger: {
                                trigger: card,
                                scroller: bodyRef.current,
                                start: "top 88%",
                                once: true,
                            },
                        }
                    );
                });
        }, bodyRef);

        return () => ctx.revert();
    }, []);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="journey" />
                <h2>My Journey</h2>
                <nav className="journey-year-nav" aria-label="Jump to year">
                    {YEARS.map((year) => (
                        <button
                            key={year}
                            type="button"
                            className={`journey-year-nav-btn${year === activeYear ? " is-active" : ""}`}
                            onClick={() => scrollToYear(year)}
                        >
                            {year}
                        </button>
                    ))}
                </nav>
            </div>

            <div ref={bodyRef} className="journey-body">
                <header className="journey-intro">
                    <span className="journey-intro-kicker">ADAM JEMMALI</span>
                    <h1>I build reliable software for real-time ideas.</h1>
                    <p>Full-stack engineer focused on backend systems, computer vision, and AI products.</p>
                </header>

                <section className="journey-section">
                    <div className="journey-section-head">
                        <h2>Work Experience</h2>
                    </div>

                    <div className="journey-timeline">
                        {WORK_GROUPS.map((group) => (
                            <React.Fragment key={group.year}>
                                <div className="journey-year-divider" data-year={group.year}>
                                    <span className="journey-year-divider-line" aria-hidden="true" />
                                    <span className="journey-year-divider-label">{group.year}</span>
                                    <span className="journey-year-divider-line" aria-hidden="true" />
                                </div>
                                {group.entries.map((entry) => (
                                    <JourneyWorkEntry key={entry.id} entry={entry} />
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </section>

                <section className="journey-section journey-section-support">
                    <div className="journey-section-head">
                    
                        <h2>Education, Awards &amp; What's Next</h2>
                    </div>

                    <div className="journey-support-grid">
                        {SUPPORTING_ENTRIES.map((entry) => (
                            <SupportingEntry key={entry.id} entry={entry} />
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

const JourneyWindow = WindowWrapper(Journey, "journey");
export default JourneyWindow;

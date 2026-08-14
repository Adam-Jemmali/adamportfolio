import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ── Work experience, chronological (most recent first) ────────────────── */
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
            "Sports analytics company building real-time computer vision infrastructure for professional soccer.",
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
            "AI-driven workflow automation for B2B clients, primarily in real estate, using no-code and AI tooling.",
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
        icon: "/public/icons/grad.svg",
        tag: "Distributed Systems Developer",
        title: "University of Ottawa AI+ Society",
        period: "Oct 2025 – Jan 2026",
        year: "2025",
        location: "Ottawa, ON · Event-driven backend infrastructure for a 3-person Agile team",
        summary:
            "Replaced synchronous polling with asynchronous message queues to scale event-driven backend infrastructure.",
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
            "Gamified EdTech SaaS for verifiable first-attempt skill recording and practice across academic and applied subjects.",
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

/* ── Education, certifications, awards, and current focus ───────────────── */
const SUPPORTING_ENTRIES = [
    {
        id: "education",
        type: "education",
        icon: "/public/icons/grad.svg",
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
        bullets: [
            "AWS Fundamentals of Machine Learning and Artificial Intelligence — Amazon Web Services, Oct 2025",
            "Intro to Machine Learning (scikit-learn, Random Forest, model evaluation) — Kaggle, Nov 2025",
            "Career Essentials in GitHub Professional Certificate — GitHub, Aug 2026",
            "Practical GitHub Actions — LinkedIn Learning, Feb 2026",
            "AWS Cloud Practitioner — Amazon Web Services, In Progress 2026",
            "Docker and DevOps Fundamentals — In Progress 2026",
        ],
    },
    {
        id: "awards",
        type: "achievement",
        icon: "/public/icons/trophy.svg",
        tag: "Awards & Recognition",
        title: "Recognition",
        bullets: [
            "Best Use of Snowflake API, Invest Ottawa Hackathon 2026 — Chronos Cloud distributed digital twin platform.",
            "Faculty of Science Achievement Award, University of Ottawa, 2024–2025 — awarded to top-performing Faculty of Science students.",
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
            "Designing real-time sports analytics and computer vision pipelines alongside agentic AI systems with Claude, Gemini, Groq, LangChain, and n8n.",
        skills: ["DSA (NeetCode)", "Linux debugging (SadServers)", "Shell tools", "Git internals", "MIT Missing Semester", "SQLZoo"],
    },
];

const JourneyWorkEntry = ({ entry, index }) => (
    <article className={`journey-entry journey-entry-${entry.type}`}>
        <div className="journey-rail" aria-hidden="true">
            <span className="journey-dot">
                {entry.logo ? (
                    <img className="journey-logo" src={entry.logo} alt="" />
                ) : (
                    <img src={entry.icon} alt="" />
                )}
            </span>
            {index < WORK_EXPERIENCE.length - 1 && <span className="journey-line" />}
        </div>

        <div className="journey-card journey-enter">
            <span className="journey-year journey-year-anim" aria-hidden="true">
                {entry.year}
            </span>
            <div className="journey-card-topline">
                <span className="journey-tag">{entry.tag}</span>
                <span className="journey-period">{entry.period}</span>
            </div>
            <h3>{entry.title}</h3>
            {entry.location && <p className="journey-location">{entry.location}</p>}
            <p className="journey-summary">{entry.summary}</p>

            <ul className="journey-highlights">
                {entry.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>

            {entry.skills && (
                <div className="journey-skills" aria-label={`${entry.title} technologies`}>
                    {entry.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
            )}
        </div>
    </article>
);

const SupportingEntry = ({ entry }) => (
    <article className={`journey-card journey-enter journey-support journey-support-${entry.type}`}>
        <div className="journey-card-topline">
            <span className="journey-tag">{entry.tag}</span>
            {entry.period && <span className="journey-period">{entry.period}</span>}
        </div>
        <h3>{entry.title}</h3>
        {entry.subtitle && <p className="journey-subtitle">{entry.subtitle}</p>}
        {entry.location && <p className="journey-location">{entry.location}</p>}
        {entry.summary && <p className="journey-summary">{entry.summary}</p>}

        {entry.bullets && (
            <ul className="journey-highlights">
                {entry.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
        )}

        {entry.skills && (
            <div className="journey-skills" aria-label={`${entry.title} technologies`}>
                {entry.skills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
        )}
    </article>
);

const Journey = () => {
    const bodyRef = useRef(null);

    useGSAP(() => {
        if (!bodyRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".journey-intro > *",
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }
            );

            ScrollTrigger.batch(".journey-enter", {
                scroller: bodyRef.current,
                start: "top 88%",
                once: true,
                onEnter: (batch) =>
                    gsap.fromTo(
                        batch,
                        { opacity: 0, y: 46 },
                        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", overwrite: true }
                    ),
            });

            gsap.utils.toArray(".journey-year-anim").forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, scale: 0.85, x: -24 },
                    {
                        opacity: 1,
                        scale: 1,
                        x: 0,
                        duration: 0.9,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: el,
                            scroller: bodyRef.current,
                            start: "top 92%",
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
            </div>

            <div ref={bodyRef} className="journey-body">
                <header className="journey-intro">
                    <span className="journey-intro-kicker">ADAM JEMMALI</span>
                    <h1>Full-Stack Software Engineer</h1>
                    <p className="journey-intro-sub">Backend Systems &amp; AI-Integrated Applications</p>
                    <p>
                        Full-stack software engineering student proficient in Python, OpenCV, FastAPI, SQL, Git, Docker,
                        and CI/CD, with hands-on production experience building real-time computer vision systems for
                        professional sports analytics and full-stack SaaS platforms shipped and operated end-to-end.
                        Sharpening system design, testing, and Linux debugging daily — seeking a Summer 2027 internship
                        in software engineering, backend development, full-stack development, or applied AI/ML systems.
                    </p>
                </header>

                <section className="journey-section">
                    <div className="journey-section-head">
                        <span className="journey-section-kicker">Experience · Building · Learning</span>
                        <h2>Work Experience</h2>
                    </div>

                    <div className="journey-timeline">
                        {WORK_EXPERIENCE.map((entry, index) => (
                            <JourneyWorkEntry key={entry.id} entry={entry} index={index} />
                        ))}
                    </div>
                </section>

                <section className="journey-section journey-section-support">
                    <div className="journey-section-head">
                        <span className="journey-section-kicker">Growth · Learning · Recognition</span>
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

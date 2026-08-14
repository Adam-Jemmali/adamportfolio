import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

const JOURNEY_ENTRIES = [
    {
        id: "sportlogiq",
        type: "work",
        logo: "public/images/sportlogiq.jpg",
        logoAlt: "Sportlogiq logo",
        tag: "Computer Vision & ML Developer Intern",
        title: "Sportlogiq",
        period: "May 2024 – Aug 2024",
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
        id: "mentrixa",
        type: "work",
        logo: "public/images/mentrixa.png",
        logoAlt: "Mentrixa logo",
        tag: "Ex-Founder",
        title: "Mentrixa",
        period: "Feb 2026 – Aug 2026",
        location: "Ottawa, ON · Remote",
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
    {
        id: "upwork",
        type: "work",
        logo: "public/images/Upwork-New-Logo.png",
        logoAlt: "Upwork logo",
        tag: "Freelance AI Automation Specialist",
        title: "Upwork",
        period: "May 2024 – Nov 2025",
        location: "Remote · 7 clients",
        summary:
            "AI-driven workflow automation for clients across education, recruiting, and real estate.",
        bullets: [
            "Engineered AI-driven workflow automations for B2B clients, primarily in real estate, using Make.com, Zapier, and Monday.com, increasing lead conversion by 35%.",
            "Designed event-triggered CRM automations that achieved a 40% client ROI within two months of deployment.",
            "Reduced manual operations by over 20 hours per week per client through scalable no-code workflow architecture.",
        ],
        skills: ["Make.com", "Zapier", "Monday.com", "CRM Automation", "AI Workflows"],
    },
    {
        id: "education",
        type: "education",
        icon: "/public/icons/grad.svg",
        tag: "Education",
        title: "University of Ottawa",
        period: "BSc Computer Science",
        location: "Ottawa, ON",
        summary:
            "Building a foundation in computer science while specializing my work around computer vision, AI systems, sports analytics, and EdTech.",
    },
    {
        id: "mchacks",
        type: "achievement",
        icon: "/public/icons/trophy.svg",
        tag: "Hackathon",
        title: "McHacks × Backboard.io",
        period: "9th overall",
        summary:
            "Built OmniContext OS, a thin-client AI system with persistent memory across Slack, email, and the web.",
    },
    {
        id: "hackconcordia",
        type: "achievement",
        icon: "/public/icons/trophy.svg",
        tag: "Hackathon",
        title: "HackConcordia",
        period: "Winner · Best Use of Snowflake API",
        summary:
            "Built AeroGuard, a real-time SOC decision platform in 24 hours to surface the most critical security actions for analysts.",
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
    },
];

const JourneyEntry = ({ entry, isLast }) => (
    <article className={`journey-entry journey-entry-${entry.type}`}>
        <div className="journey-rail" aria-hidden="true">
            <span className="journey-dot">
                {entry.logo ? (
                    <img className="journey-logo" src={entry.logo} alt="" />
                ) : (
                    <img src={entry.icon} alt="" />
                )}
            </span>
            {!isLast && <span className="journey-line" />}
        </div>

        <div className="journey-card">
            <div className="journey-card-topline">
                <span className="journey-tag">{entry.tag}</span>
                <span className="journey-period">{entry.period}</span>
            </div>
            <h3>{entry.title}</h3>
            {entry.location && <p className="journey-location">{entry.location}</p>}
            <p className="journey-summary">{entry.summary}</p>

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
        </div>
    </article>
);

const Journey = () => (
    <>
        <div id="window-header">
            <WindowsControls target="journey" />
            <h2>My Journey</h2>
        </div>

        <div className="journey-body">
            <header className="journey-intro">
                <span className="journey-intro-kicker">Experience · Building · Learning</span>
                <h1>My Journey</h1>
                <p>
                    From shipping production computer vision for professional soccer to building products and automations,
                    these are the problems I have worked on, what I developed, and what I learned along the way.
                </p>
            </header>

            <div className="journey-timeline">
                {JOURNEY_ENTRIES.map((entry, index) => (
                    <JourneyEntry
                        key={entry.id}
                        entry={entry}
                        isLast={index === JOURNEY_ENTRIES.length - 1}
                    />
                ))}
            </div>
        </div>
    </>
);

const JourneyWindow = WindowWrapper(Journey, "journey");
export default JourneyWindow;

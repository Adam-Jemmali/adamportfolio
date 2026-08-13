import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

const MILESTONES = [
    {
        icon: "/public/icons/grad.svg",
        tag: "Education",
        title: "University of Ottawa",
        text: "BSc Computer Science. Designing computer vision and AI systems for sports analytics, agentic AI, and EdTech.",
    },
    {
        icon: "/public/icons/work.svg",
        tag: "Founder",
        title: "Mentrixa",
        text: "An AI tutoring SaaS. I help teams understand AI + computer vision in sports and ship production scale systems.",
    },
    {
        icon: "/public/icons/trophy.svg",
        tag: "Hackathon",
        title: "McHacks × Backboard.io",
        text: "Placed 9th overall building OmniContext OS, a thin client AI system with persistent memory across Slack, email, and web.",
    },
    {
        icon: "/public/icons/trophy.svg",
        tag: "Hackathon",
        title: "HackConcordia",
        text: "Winner, Best Use of Snowflake API. AeroGuard is a real time SOC decision platform built in 24 hours.",
    },
    {
        icon: "/public/icons/gicon2.svg",
        tag: "Focus now",
        title: "Agentic AI & Computer Vision",
        text: "Building real time sports analytics and computer vision pipelines with Claude, Gemini, Groq, LangChain, and n8n.",
    },
];

const Journey = () => (
    <>
        <div id="window-header">
            <WindowsControls target="journey" />
            <h2>Journey</h2>
        </div>

        <div className="journey-body">
            {MILESTONES.map((milestone, i) => (
                <div key={milestone.title} className="journey-entry">
                    <div className="journey-rail">
                        <span className="journey-dot">
                            <img src={milestone.icon} alt={milestone.tag} />
                        </span>
                        {i < MILESTONES.length - 1 && <span className="journey-line" />}
                    </div>

                    <div className="journey-card">
                        <span className="journey-tag">{milestone.tag}</span>
                        <h3>{milestone.title}</h3>
                        <p>{milestone.text}</p>
                    </div>
                </div>
            ))}
        </div>
    </>
);

const JourneyWindow = WindowWrapper(Journey, "journey");
export default JourneyWindow;

import { Folder, Globe, Images, Mail, Terminal, Gamepad2, FileText, Palette, Wallpaper } from "lucide-react";

const navLinks = [
    {
        id: 1,
        name: "Projects",
        type: "finder",
    },
    {
        id: 2,
        name: "Contact",
        type: "contact",
    },
    {
        id: 3,
        name: "Resume",
        type: "resume",
    },
];

const navIcons = [
    {
        id: 1,
        img: "public/icons/wifi.svg",
    },

    {
        id: 3,
        img: "public/icons/user.svg",
    },

    {
        id: 4,
        img: "public/icons/mode.svg",
    },
    {
        id: 5,
        img: "public/icons/sound.svg",
    },
];

const dockApps = [
    {
        id: "finder",
        name: "Portfolio",
        icon: Folder,
        canOpen: true,
    },
    {
        id: "safari",
        name: "Web",
        icon: Globe,
        canOpen: true,
    },
    {
        id: "photos",
        name: "Gallery",
        icon: Images,
        canOpen: true,
    },
    {
        id: "contact",
        name: "Contact",
        icon: Mail,
        canOpen: true,
    },
    {
        id: "terminal",
        name: "Skills",
        icon: Terminal,
        canOpen: true,
    },
    {
        id: "journey",
        name: "Journey",
        icon: "public/icons/journey.svg",
        canOpen: true,
    },
    {
        id: "games",
        name: "Games",
        icon: Gamepad2,
        canOpen: true,
    },
    // Kid Pix and Backgrounds stay on the desktop so the dock stays focused
    // on the essentials.
];

const desktopApps = [
    {
        id: "trappie",
        name: "Trappie",
        icon: "public/icons/t-monogram.svg",
        appId: null,
        tile: "linear-gradient(135deg, #0f172a, #1e293b)",
    },
    {
        id: "web",
        name: "Web",
        icon: Globe,
        appId: "safari",
        tile: "linear-gradient(135deg, #38bdf8, #2563eb)",
    },
    {
        id: "skills",
        name: "Skills",
        icon: Terminal,
        appId: "terminal",
        tile: "linear-gradient(135deg, #34d399, #0f766e)",
    },
    {
        id: "gallery",
        name: "Gallery",
        icon: Images,
        appId: "photos",
        tile: "linear-gradient(135deg, #f472b6, #a855f7)",
    },
    {
        id: "games",
        name: "Games",
        icon: Gamepad2,
        appId: "games",
        tile: "linear-gradient(135deg, #fb923c, #ef4444)",
    },
    {
        id: "contact",
        name: "Contact",
        icon: Mail,
        appId: "contact",
        tile: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    },
    {
        id: "resume",
        name: "Resume",
        icon: FileText,
        appId: "resume",
        tile: "linear-gradient(135deg, #94a3b8, #475569)",
    },
    {
        id: "journey",
        name: "Journey",
        icon: "public/icons/journey.svg",
        appId: "journey",
        tile: "linear-gradient(135deg, #a78bfa, #7c3aed)",
    },
    {
        id: "kidpix",
        name: "Kid Pix",
        icon: Palette,
        appId: "kidpix",
        tile: "linear-gradient(135deg, #fb7185, #f59e0b)",
    },
    {
        id: "backgrounds",
        name: "Backgrounds",
        icon: Wallpaper,
        appId: "backgrounds",
        tile: "linear-gradient(135deg, #22d3ee, #6366f1)",
    },
];

const wallpapers = [
    { id: "aurora", name: "Aurora", type: "image", value: "/public/images/wallpaper.svg" },
    { id: "midnight", name: "Midnight", type: "gradient", value: "linear-gradient(160deg, #0b1526 0%, #1e3a5f 55%, #3c6eb4 100%)" },
    { id: "sunset", name: "Sunset", type: "gradient", value: "linear-gradient(160deg, #1a0b2e 0%, #5f1e3a 50%, #b4653c 100%)" },
    { id: "forest", name: "Forest", type: "gradient", value: "linear-gradient(160deg, #06251f 0%, #0f4c3a 55%, #2e7d5b 100%)" },
];

const blogPosts = [
    {
        id: 1,
        date: "Feb 8 , 2026",
        title:
            " How we built NeuroDesk, a brain inspired AI system",
        image: "public/images/blog1.png",
        link: "https://www.youtube.com/watch?v=TJSrwQRLg1A",
    },
    {
        id: 2,
        date: "Jan 14 , 2026",
        title:
            "Designing OmniContext OS: Building Persistent Memory Across AI Workflows",
        image: "public/images/blog4.png",
        link: "https://www.youtube.com/watch?v=TJSrwQRLg1A",
    },

    {
        id: 3,
        date: "Nov 10, 2025",
        title: "Podcast: The Ultimate Tutoring App Management System",
        image: "public/images/blog2.png",
        link: "https://drive.google.com/file/d/1ioy3uxYsHL9Cz9BCTpwvNCW-walK1Vj5/view",
    },
    {
        id: 4,
        date: "Jan 16, 2026",
        title: " Hackathon Projects! ",
        image: "public/images/blog3.png",
        link: "https://devpost.com/Adam-Jemmali",
    },
];

const techStack = [
    {
        category: "Languages",
        items: ["Python", "TypeScript", "Go", "C++", "Java", "SQL", "Bash"],
    },
    {
        category: "AI & CV",
        items: ["PyTorch", "OpenCV", "YOLOv8", "LangChain", "RAG", "HuggingFace"],
    },
    {
        category: "Backend",
        items: ["FastAPI", "Node.js", "Docker", "Kubernetes", "AWS", "Supabase"],
    },
    {
        category: "Frontend",
        items: ["Next.js", "React", "Tailwind", "Vercel", "Stripe"],
    },
    {
        category: "Databases",
        items: ["PostgreSQL", "MongoDB", "Redis", "Snowflake"],
    },
    {
        category: "DevOps",
        items: ["GitHub Actions", "Linux", "Playwright", "Sentry", "Make.com"],
    },
];

// Shared skill metadata (brand logo + category), reused across Journey, Terminal, and Portfolio.
const skillMeta = {
    // Languages
    "Python": { logo: "public/images/skills/python.svg", category: "Languages" },
    "TypeScript": { logo: "public/images/skills/typescript.svg", category: "Languages" },
    "JavaScript": { logo: "public/images/skills/javascript.svg", category: "Languages" },
    "Go": { logo: "public/images/skills/go.svg", category: "Languages" },
    "C++": { logo: "public/images/skills/cplusplus.svg", category: "Languages" },
    "Java": { logo: "public/images/skills/openjdk.svg", category: "Languages" },
    "SQL": { logo: "", category: "Languages" },
    "Bash": { logo: "public/images/skills/gnubash.svg", category: "Languages" },
    // AI & CV
    "PyTorch": { logo: "public/images/skills/pytorch.svg", category: "AI & CV" },
    "OpenCV": { logo: "public/images/skills/opencv.svg", category: "AI & CV" },
    "NumPy": { logo: "public/images/skills/numpy.svg", category: "AI & CV" },
    "TensorFlow": { logo: "public/images/skills/tensorflow.svg", category: "AI & CV" },
    "YOLOv8": { logo: "public/images/skills/ultralytics.svg", category: "AI & CV" },
    "LangChain": { logo: "public/images/skills/langchain.svg", category: "AI & CV" },
    "RAG": { logo: "", category: "AI & CV" },
    "HuggingFace": { logo: "public/images/skills/huggingface.svg", category: "AI & CV" },
    "DeepSeek AI": { logo: "public/images/skills/deepseek.svg", category: "AI & CV" },
    "Google Gemini": { logo: "public/images/skills/googlegemini.svg", category: "AI & CV" },
    "OpenRouter": { logo: "public/images/skills/openrouter.svg", category: "AI & CV" },
    // Backend
    "FastAPI": { logo: "public/images/skills/fastapi.svg", category: "Backend" },
    "Node.js": { logo: "public/images/skills/nodedotjs.svg", category: "Backend" },
    "Docker": { logo: "public/images/skills/docker.svg", category: "Backend" },
    "Kubernetes": { logo: "public/images/skills/kubernetes.svg", category: "Backend" },
    "AWS": { logo: "", category: "Backend" },
    "Supabase": { logo: "public/images/skills/supabase.svg", category: "Backend" },
    "WebSockets": { logo: "public/images/skills/websocket.svg", category: "Backend" },
    "WebSocket": { logo: "public/images/skills/websocket.svg", category: "Backend" },
    "WebRTC": { logo: "public/images/skills/webrtc.svg", category: "Backend" },
    "RabbitMQ": { logo: "public/images/skills/rabbitmq.svg", category: "Backend" },
    "NATS/JetStream": { logo: "public/images/skills/natsdotio.svg", category: "Backend" },
    "Twilio": { logo: "", category: "Backend" },
    "Backboard.io": { logo: "", category: "Backend" },
    // Frontend
    "Next.js": { logo: "public/images/skills/nextdotjs.svg", category: "Frontend" },
    "Next.js 14": { logo: "public/images/skills/nextdotjs.svg", category: "Frontend" },
    "React": { logo: "public/images/skills/react.svg", category: "Frontend" },
    "Tailwind": { logo: "public/images/skills/tailwindcss.svg", category: "Frontend" },
    "Vercel": { logo: "public/images/skills/vercel.svg", category: "Frontend" },
    "Stripe": { logo: "public/images/skills/stripe.svg", category: "Frontend" },
    "Streamlit": { logo: "public/images/skills/streamlit.svg", category: "Frontend" },
    "Plotly": { logo: "public/images/skills/plotly.svg", category: "Frontend" },
    "MediaRecorder API": { logo: "", category: "Frontend" },
    // Databases
    "Postgres": { logo: "public/images/skills/postgresql.svg", category: "Databases" },
    "PostgreSQL": { logo: "public/images/skills/postgresql.svg", category: "Databases" },
    "MongoDB": { logo: "public/images/skills/mongodb.svg", category: "Databases" },
    "MongoDB Atlas": { logo: "public/images/skills/mongodb.svg", category: "Databases" },
    "Redis": { logo: "public/images/skills/redis.svg", category: "Databases" },
    "Snowflake": { logo: "public/images/skills/snowflake.svg", category: "Databases" },
    "SQLite": { logo: "public/images/skills/sqlite.svg", category: "Databases" },
    // DevOps
    "Git": { logo: "public/images/skills/git.svg", category: "DevOps" },
    "GitHub Actions": { logo: "public/images/skills/githubactions.svg", category: "DevOps" },
    "CI/CD": { logo: "", category: "DevOps" },
    "Linux": { logo: "public/images/skills/linux.svg", category: "DevOps" },
    "Playwright": { logo: "", category: "DevOps" },
    "Sentry": { logo: "public/images/skills/sentry.svg", category: "DevOps" },
    "Make.com": { logo: "public/images/skills/make.svg", category: "DevOps" },
    "Zapier": { logo: "public/images/skills/zapier.svg", category: "DevOps" },
    "Monday.com": { logo: "public/images/skills/monday.svg", category: "DevOps" },
    "Jenkins": { logo: "public/images/skills/jenkins.svg", category: "DevOps" },
    "PyTest": { logo: "public/images/skills/pytest.svg", category: "DevOps" },
    "Agile/Scrum": { logo: "", category: "Process" },
    // Automation / practice
    "CRM Automation": { logo: "", category: "Automation" },
    "AI Workflows": { logo: "", category: "Automation" },
    "DSA (NeetCode)": { logo: "", category: "Practice" },
    "Linux debugging (SadServers)": { logo: "", category: "Practice" },
    "Shell tools": { logo: "", category: "Practice" },
    "Git internals": { logo: "", category: "Practice" },
    "MIT Missing Semester": { logo: "", category: "Practice" },
    "SQLZoo": { logo: "", category: "Practice" },
};

const socials = [
    {
        id: 1,
        text: "Github",
        icon: "public/icons/github.svg",
        bg: "#000000",
        link: "https://github.com/Adam-Jemmali",
    },
    {
        id: 3,
        text: "Instagram",
        icon: "public/icons/twitter.svg",
        bg: "#FFC0CB",
        link: "https://www.instagram.com/madaj_2/",
    },
    {
        id: 4,
        text: "LinkedIn",
        icon: "public/icons/linkedin.svg",
        bg: "#05b6f6",
        link: "https://www.linkedin.com/in/adam-jem/",
    },
];

const photosLinks = [
    {
        id: 1,
        icon: "public/icons/gicon1.svg",
        title: "Library",
    },
    {
        id: 2,
        icon: "public/icons/gicon2.svg",
        title: "Memories",
    },
    {
        id: 3,
        icon: "public/icons/file.svg",
        title: "Places",
    },
    {
        id: 4,
        icon: "public/icons/gicon4.svg",
        title: "People",
    },
    {
        id: 5,
        icon: "public/icons/gicon5.svg",
        title: "Favorites",
    },
];

const gallery = [
    {
        id: 1,
        img: "public/images/gal1.png",
    },
    {
        id: 2,
        img: "public/images/gal2.png",
    },
    {
        id: 3,
        img: "/images/gal3.png",
    },
    {
        id: 4,
        img: "public/images/gal4.png",
    },
];

export {
    navLinks,
    navIcons,
    dockApps,
    desktopApps,
    wallpapers,
    blogPosts,
    techStack,
    skillMeta,
    socials,
    photosLinks,
    gallery,
};

const WORK_LOCATION = {
    id: 1,
    type: "work",
    name: "Work",
    icon: "public/images/home.png",
    kind: "folder",
    children: [
        // ▶ Project 1 — OmniContext OS
        {
            id: 5,
            name: "OmniContext OS",
            icon: "public/images/folder.png",
            kind: "folder",
            category: "Agentic AI",
            stack: ["TypeScript", "Node.js", "RAG"],
            position: "top-10 left-80",
            windowPosition: "top-[5vh] left-5",
            children: [
                {
                    id: 1,
                    name: "OmniContext OS.txt",
                    icon: "public/images/txt.png",
                    kind: "file",
                    fileType: "txt",
                    position: "top-5 left-10",
                    description: [
                        "OmniContext OS is a thin client AI system designed to maintain persistent memory across Slack, email, and web interfaces.",
                        "Most AI assistants are stateless, switching tools forces users to reexplain context. We built for continuity instead of isolated prompts.",
                        "The architecture centralizes intelligence using Backboard.io for stateful threads, memory persistence, and LLM orchestration.",
                        "A Node.js / TypeScript backend normalizes multichannel events and resolves state consistently across platforms.",
                        "We placed 9th overall at the McHacks × Backboard.io prehackathon challenge.",
                        "RAG integration is currently in development for our MVP to enable RAG contextual responses."
                    ],
                },
                {
                    id: 2,
                    name: "How it works.ytb",
                    icon: "public/images/ytb.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://www.youtube.com/watch?v=K1wJtulUM7A",
                    position: "top-5 left-60",
                },

                {
                    id: 4,
                    name: "Backboard.jpg",
                    icon: "public/images/plain.png",
                    kind: "file",
                    fileType: "fig",
                    href: "https://backboard.io",
                    position: "top-50 left-10",
                },
            ],
        },

        // ▶ Project 2 — AeroGuard (HackConcordia Winner)
        {
            id: 6,
            name: "AeroGuard (A.E.G.I.S)",
            icon: "public/images/folder.png",
            kind: "folder",
            category: "Real-time Systems",
            stack: ["Snowflake", "MongoDB", "Google Gemini", "OpenRouter", "FastAPI"],
            position: "top-10 left-5",
            windowPosition: "top-[20vh] left-7",
            children: [
                {
                    id: 1,
                    name: "AeroGuard.txt",
                    icon: "public/images/txt.png",
                    kind: "file",
                    fileType: "txt",
                    position: "top-10  left-40",
                    description: [
                        "AeroGuard is a real time SOC decision platform built at HackConcordia in 24 hours.",
                        "Instead of overwhelming analysts with hundreds of alerts, the system predicts threats and surfaces the 3 most critical actions in under 60 seconds.",
                        "Built with Snowflake for analytics, MongoDB for real time state, and Google Gemini via OpenRouter for explainable AI reasoning.",
                        "Integrated ElevenLabs for voice alerting in high severity scenarios.",
                        "Powered by a FastAPI backend engineered for deterministic decisions and auditability.",
                        "Winner: Best Use of Snowflake API."

                    ],
                },
                {
                    id: 2,
                    name: "Demo.ytb",
                    icon: "public/images/ytb.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://www.youtube.com/watch?v=v50brOXF6v4",
                    position: "top-10 left-5",
                },
                {
                    id: 3,
                    name: "A.E.G.I.S. repo",
                    icon: "public/images/github.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://lnkd.in/ewetvar7",
                    position: "top-50 left-5",
                },

            ],
        },

        //project 3 Neurodesk
        {
            id: 7,
            name: "NeuroDesk",
            icon: "public/images/folder.png",
            kind: "folder",
            category: "Agentic AI",
            stack: ["FastAPI", "PostgreSQL", "Redis", "Next.js", "Python"],
            position: "top-10 left-45  ",
            windowPosition: "top-[20vh] left-7",
            children: [
                {
                    id: 1,
                    name: "NeuroDesk.txt",
                    icon: "public/images/txt.png",
                    kind: "file",
                    fileType: "txt",
                    position: "top-10  left-40",
                    description: [
                        "NeuroDesk is a brain inspired AI command center that turns simple natural language requests into structured outcomes.",
                        "Instead of just chatting, NeuroDesk plans tasks, coordinates specialized AI agents, enforces approvals and keeps humans in control at every step.",
                        "Users can ask for research, draft professional communications, compare products, or make decisions(just like our brain)  and the system handles execution with built in guardrails and spending limits.",
                        "Every action is logged with a full audit trail, creating trust, accountability, and enterprise transparency.",
                        "Designed as a scalable AI middleware layer, NeuroDesk bridges conversation and execution, transforming AI from a passive assistant into a reliable operational partner.",
                        "Built with a modular architecture ready for enterprise integrations, workflow automation, and future payment or hiring systems.",
                        "NeuroDesk demonstrates the next evolution of AI: not just intelligent, but responsible, actionable and aligned with human oversight."
                    ]

                },
                {
                    id: 2,
                    name: "Demo.ytb",
                    icon: "public/images/ytb.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://www.youtube.com/watch?v=v50brOXF6v4",
                    position: "top-10 left-5",
                },
                {
                    id: 3,
                    name: "NeuroDesk.repo",
                    icon: "public/images/github.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://github.com/Adam-Jemmali/NeuroDesk",
                    position: "top-50 left-5",
                },

            ],
        },

        // ▶ Project 4 — Solen AI (Autonomous Software Deployment Platform)
        {
            id: 8,
            name: "Solen AI",
            icon: "public/images/folder.png",
            kind: "folder",
            category: "Agentic AI",
            stack: ["Docker", "Python", "GitHub Actions"],
            position: "top-10 left-80",
            windowPosition: "top-[5vh] left-5",
            children: [
                {
                    id: 1,
                    name: "Solen AI.txt",
                    icon: "public/images/txt.png",
                    kind: "file",
                    fileType: "txt",
                    position: "top-5 left-10",
                    description: [
                        "Solen AI is an autonomous software deployment platform: from a single natural-language prompt it covers intent classification, LLM-driven code generation, Docker containerization, and deployment monitoring.",
                        "A closed-loop repair system monitors live deployments, diagnoses failures using LLM reasoning, and regenerates fixes.",
                        "Circuit-breaker patterns and an action-level audit trail keep every autonomous step observable and safe."
                    ],
                },
                {
                    id: 2,
                    name: "Solen AI.repo",
                    icon: "public/images/github.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://github.com/Adam-Jemmali",
                    position: "top-50 left-5",
                },
            ],
        },

        // ▶ Project 5 — A.E.G.I.S. Garden (Real-Time Incident Triage Platform)
        {
            id: 9,
            name: "A.E.G.I.S. Garden",
            icon: "public/images/folder.png",
            kind: "folder",
            category: "Real-time Systems",
            stack: ["FastAPI", "React", "MongoDB", "Google Gemini", "OpenRouter", "WebSocket", "Docker"],
            position: "top-10 left-5",
            windowPosition: "top-[20vh] left-7",
            children: [
                {
                    id: 1,
                    name: "A.E.G.I.S. Garden.txt",
                    icon: "public/images/txt.png",
                    kind: "file",
                    fileType: "txt",
                    position: "top-10 left-40",
                    description: [
                        "An event-driven incident triage system integrating Google Gemini multimodal reasoning with structured JSON outputs and function-calling dispatch for text, image, and structured-data inputs.",
                        "Multi-provider LLM failover logic via OpenRouter with secondary model fallbacks eliminates single-provider dependency and prevents API downtime during upstream outages.",
                        "MongoDB Atlas Change Streams drive WebSocket state updates for real-time incident tracking.",
                        "Stack: FastAPI, React, MongoDB Atlas, Google Gemini, OpenRouter, WebSocket, Docker."
                    ],
                },
                {
                    id: 2,
                    name: "A.E.G.I.S. Garden.repo",
                    icon: "public/images/github.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://github.com/Adam-Jemmali",
                    position: "top-50 left-5",
                },
            ],
        },

        // ▶ Project 6 — Chronos Cloud (Event-Driven Digital Twin)
        {
            id: 10,
            name: "Chronos Cloud",
            icon: "public/images/folder.png",
            kind: "folder",
            category: "Real-time Systems",
            stack: ["Python", "FastAPI", "NATS/JetStream", "Docker", "RabbitMQ", "Redis", "PyTest", "Jenkins"],
            position: "top-10 left-45",
            windowPosition: "top-[20vh] left-7",
            children: [
                {
                    id: 1,
                    name: "Chronos Cloud.txt",
                    icon: "public/images/txt.png",
                    kind: "file",
                    fileType: "txt",
                    position: "top-10 left-40",
                    description: [
                        "An event-driven digital twin built at the Invest Ottawa Hackathon 2026, winner of Best Use of Snowflake API.",
                        "Architected a fault-tolerant message queue and state-recovery pipeline using RabbitMQ and Redis, implementing retry backoffs and dead-letter queues to handle upstream LLM rate limits and network drops.",
                        "Built a FastAPI control plane with circuit-breaker patterns and automated PyTest unit testing to harden the pipeline against upstream service failures, tracked via Git-managed Jenkins CI/CD.",
                        "Stack: Python, FastAPI, NATS/JetStream, Docker, RabbitMQ, Redis, PyTest, Jenkins."
                    ],
                },
                {
                    id: 2,
                    name: "Chronos Cloud.repo",
                    icon: "public/images/github.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://github.com/Adam-Jemmali",
                    position: "top-50 left-5",
                },
            ],
        },

        // ▶ Project 7 — B2B AI Workforce Optimizer (Scheduling & Predictive Analytics)
        {
            id: 11,
            name: "B2B AI Workforce Optimizer",
            icon: "public/images/folder.png",
            kind: "folder",
            category: "Automation & Backend",
            stack: ["FastAPI", "Streamlit", "DeepSeek AI", "Plotly", "SQLite", "Twilio"],
            position: "top-10 left-80",
            windowPosition: "top-[20vh] left-7",
            children: [
                {
                    id: 1,
                    name: "B2B AI Workforce Optimizer.txt",
                    icon: "public/images/txt.png",
                    kind: "file",
                    fileType: "txt",
                    position: "top-10 left-40",
                    description: [
                        "Resolved staffing conflicts by engineering a constraint-based scheduling pipeline combining LP heuristics with LLM-assisted shift analysis via DeepSeek AI.",
                        "Gave operations managers real-time visibility into demand spikes by building an interactive Streamlit dashboard with Plotly trend visualizations and Twilio SMS alerting.",
                        "Stack: FastAPI, Streamlit, DeepSeek AI, Plotly, SQLite, Twilio."
                    ],
                },
                {
                    id: 2,
                    name: "B2B AI Workforce Optimizer.repo",
                    icon: "public/images/github.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://github.com/Adam-Jemmali",
                    position: "top-50 left-5",
                },
            ],
        },

        // ▶ Project 8 — Distributed Systems Developer (UOttawa AI+ Society)
        {
            id: 12,
            name: "Distributed Systems (AI+ Society)",
            icon: "public/images/folder.png",
            kind: "folder",
            category: "Automation & Backend",
            stack: ["RabbitMQ", "GitHub Actions", "Git"],
            position: "top-10 left-5",
            windowPosition: "top-[20vh] left-7",
            children: [
                {
                    id: 1,
                    name: "Distributed Systems (AI+ Society).txt",
                    icon: "public/images/txt.png",
                    kind: "file",
                    fileType: "txt",
                    position: "top-10 left-40",
                    description: [
                        "Event-driven backend infrastructure for a 3-person Agile team at the University of Ottawa AI+ Society.",
                        "Replaced a synchronous polling architecture with RabbitMQ async message queues, decoupling producers from consumers and enabling backpressure-controlled throughput scaling.",
                        "Implemented GitHub Actions CI/CD with automated unit-testing gates and tagged release management, contributing as a backend developer using object-oriented design patterns in a collaborative Git-managed repository.",
                        "Oct 2025 - Jan 2026 | Ottawa, ON."
                    ],
                },
                {
                    id: 2,
                    name: "Distributed Systems.repo",
                    icon: "public/images/github.png",
                    kind: "file",
                    fileType: "url",
                    href: "https://github.com/Adam-Jemmali",
                    position: "top-50 left-5",
                },
            ],
        },
    ],

};

const ABOUT_LOCATION = {
    id: 2,
    type: "about",
    name: "About me",
    icon: "public/images/info.png",
    kind: "folder",
    children: [
        {
            id: 1,
            name: "about-me.txt",
            icon: "public/images/txt.png",
            kind: "file",
            fileType: "txt",
            position: "top-5 left-10",
            subtitle: "Full-Stack Software Engineer - Backend Systems and AI-Integrated Applications",
            description: [
                "Full-stack software engineering student proficient in Python, OpenCV, FastAPI, SQL, Git, Docker, and CI/CD, with hands-on production experience building real-time computer vision systems for professional sports analytics and full-stack SaaS platforms shipped and operated end-to-end.",
                "Sharpening system design, testing, and Linux debugging daily through structured and self-directed practice. Eligible for Government of Canada security clearance.",
                "Seeking a Summer 2027 internship in software engineering, backend development, full-stack development, or applied AI/ML systems.",
                "Designing real-time sports analytics and computer vision pipelines alongside agentic AI systems.",
                "Currently practicing daily: DSA (NeetCode), Linux systems debugging (SadServers), shell tools, git internals, debugging/profiling (MIT Missing Semester), and SQL (SQLZoo)."
            ]
        },
    ],
};

const RESUME_LOCATION = {
    id: 3,
    type: "resume",
    name: "Resume",
    icon: "public/icons/file.svg",
    kind: "folder",
    children: [
        {
            id: 1,
            name: "Resume.pdf",
            icon: "public/images/pdf.png",
            kind: "file",
            fileType: "pdf",
            href: "/public/files/resume.pdf",
        },
    ],
};


export const locations = {
    work: WORK_LOCATION,
    about: ABOUT_LOCATION,
    resume: RESUME_LOCATION,

};

const GALLERY_DATA = [
    {
        id: 'library',
        name: 'Library',
        icon: 'public/icons/gicon1.svg',
        images: [
            { id: 1, name: 'Neurodesk', imageUrl: 'public/images/blog1.png' },
            { id: 2, name: 'Podcast', imageUrl: 'public/images/blog2.png' },
            { id: 3, name: 'uottahack', imageUrl: 'public/images/hackuo.png' },
            { id: 4, name: 'AI automation', imageUrl: 'public/images/make.png' }
        ]
    },
    {
        id: 'portraits',
        name: 'Portraits',
        icon: 'public/icons/gicon2.svg',
        images: [
            { id: 1, name: 'Me', imageUrl: 'public/images/adam_Me.png' },
            { id: 2, name: 'Casual', imageUrl: 'public/images/casual.png' },
            { id: 3, name: 'Hackathon', imageUrl: 'public/images/hackathon.png' },
            { id: 4, name: 'Aura', imageUrl: 'public/images/Wpic.png' }
        ]
    },
];

const INITIAL_Z_INDEX = 1000;

const WINDOW_CONFIG = {
    finder: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    contact: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    resume: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    safari: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    photos: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    terminal: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    txtfile: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    imgfile: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    snake: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    games: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    code: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    journey: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    kidpix: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    popquiz: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
    backgrounds: { isOpen: false, minimized: false, maximized: false, zIndex: INITIAL_Z_INDEX, data: null },
};

export { INITIAL_Z_INDEX, WINDOW_CONFIG, GALLERY_DATA };
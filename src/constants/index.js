import { Folder, Globe, Images, Mail, Terminal, Gamepad2, FileText } from "lucide-react";

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
];

const desktopApps = [
    {
        id: "blog",
        name: "Blog",
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
            subtitle: "Computer Vision & AI Systems Engineer",
            description: [
                "CS student building the future of scouting. I design computer vision and AI systems for sports analytics, agentic AI, and EdTech.",
                "Founder of Mentrixa, an AI tutoring SaaS. I help teams understand AI + Computer Vision in sports and ship production scale systems.",
                "I build agentic AI with Claude, Gemini, and Groq, real time sports analytics and computer vision pipelines, and AI automation with Make.com, n8n, and LangChain.",
                "My goal is to become a Cloud & AI architect for sports organizations, designing real time platforms that help teams make smarter decisions.",
                "Outside of code I'm deep into basketball: analyzing games, strategy, and performance patterns."
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
};

export { INITIAL_Z_INDEX, WINDOW_CONFIG, GALLERY_DATA };
// Small animal mascots for every app's title bar — same spirit as Trappie and
// the Code Racer hamster. Each is a tiny hand-styled SVG that bobs gently via
// the shared .title-mascot class (20×18px, h-title-bob animation).
// Mid-tone bodies with dark outlines read well on both light and dark headers.

const Fox = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <path d="M25 22 q5 -1 4 -6" fill="#e07a3f" stroke="#7a3b16" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="13" cy="15" rx="9.5" ry="8.5" fill="#e07a3f" stroke="#7a3b16" strokeWidth="1.2" />
        <path d="M5 10 L9 3 L13 8 M21 8 L25 3 L29 10" fill="#e07a3f" stroke="#7a3b16" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M9 3 L11 7 M25 3 L23 7" stroke="#2b1c0e" strokeWidth="1.3" strokeLinecap="round" />
        <ellipse cx="13" cy="18" rx="5.2" ry="4.4" fill="#fbe3c8" />
        <circle cx="9.5" cy="14" r="1.7" fill="#2b1c0e" />
        <circle cx="16.5" cy="14" r="1.7" fill="#2b1c0e" />
        <path d="M11 19.5 q2 1.5 4 0" fill="none" stroke="#7a3b16" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const Spider = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <path d="M10 11 q-4 -3 -7 -1 M10 14 q-5 0 -8 2 M10 17 q-4 2 -6 5 M10 20 q-3 3 -5 5" stroke="#5b21b6" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        <path d="M22 11 q4 -3 7 -1 M22 14 q5 0 8 2 M22 17 q4 2 6 5 M22 20 q3 3 5 5" stroke="#5b21b6" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="14.5" r="8.5" fill="#8b5cf6" stroke="#5b21b6" strokeWidth="1.2" />
        <circle cx="12.5" cy="13" r="2" fill="#ffffff" stroke="#2b1c0e" strokeWidth="0.8" />
        <circle cx="19.5" cy="13" r="2" fill="#ffffff" stroke="#2b1c0e" strokeWidth="0.8" />
        <circle cx="12.5" cy="13" r="0.9" fill="#2b1c0e" />
        <circle cx="19.5" cy="13" r="0.9" fill="#2b1c0e" />
        <path d="M14.5 17.5 q1.5 1.1 3 0" fill="none" stroke="#2b1c0e" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

const Panda = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <ellipse cx="16" cy="16.5" rx="11" ry="8.5" fill="#f4f4f5" stroke="#3f3f46" strokeWidth="1.2" />
        <circle cx="8.5" cy="10" r="3.8" fill="#27272a" />
        <circle cx="23.5" cy="10" r="3.8" fill="#27272a" />
        <circle cx="11.5" cy="14" r="2.5" fill="#27272a" />
        <circle cx="20.5" cy="14" r="2.5" fill="#27272a" />
        <circle cx="11.5" cy="14" r="1.1" fill="#ffffff" />
        <circle cx="20.5" cy="14" r="1.1" fill="#ffffff" />
        <path d="M13.5 18 q2.5 2 5 0" fill="none" stroke="#3f3f46" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="12" cy="21.5" rx="3.2" ry="2" fill="#27272a" />
        <ellipse cx="20" cy="21.5" rx="3.2" ry="2" fill="#27272a" />
    </svg>
);

const Pigeon = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <ellipse cx="16" cy="17" rx="11" ry="8" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
        <circle cx="10.5" cy="11.5" r="5.2" fill="#94a3b8" stroke="#475569" strokeWidth="1.2" />
        <ellipse cx="21" cy="18" rx="4.6" ry="3.4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.9" />
        <path d="M6.5 12 l-4.5 0.5" stroke="#f59e0b" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="8.8" cy="9.8" r="1.5" fill="#2b1c0e" />
        <circle cx="12.8" cy="9.8" r="1.5" fill="#2b1c0e" />
        <path d="M9 13.5 q2 1.5 4 0" fill="none" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        <path d="M22.5 22.5 l1 2.5 M26.5 22.5 l-1 2.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const Penguin = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <ellipse cx="16" cy="17" rx="10" ry="9" fill="#27272a" stroke="#18181b" strokeWidth="1.2" />
        <ellipse cx="16" cy="19.5" rx="5.4" ry="6" fill="#f4f4f5" />
        <circle cx="12" cy="10" r="1.8" fill="#ffffff" />
        <circle cx="20" cy="10" r="1.8" fill="#ffffff" />
        <circle cx="12" cy="10" r="0.9" fill="#2b1c0e" />
        <circle cx="20" cy="10" r="0.9" fill="#2b1c0e" />
        <path d="M16 12.5 l0 3" stroke="#f59e0b" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M11 25 l-2 1.8 M21 25 l2 1.8" stroke="#f59e0b" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);

const Turtle = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <circle cx="17" cy="14.5" r="9" fill="#4d7c0f" stroke="#365314" strokeWidth="1.2" />
        <path d="M11.5 11.5 h11 M17 6.5 v16 M13 9 l-1.5 6 M21 9 l1.5 6 M14 19 l5 -3" fill="none" stroke="#365314" strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="8" cy="16" r="3" fill="#86efac" stroke="#365314" strokeWidth="1" />
        <circle cx="7" cy="15" r="1.1" fill="#2b1c0e" />
        <path d="M9.5 18.5 q0.8 0.8 1.8 0.3" fill="none" stroke="#365314" strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx="13" cy="23.5" rx="2.6" ry="1.6" fill="#86efac" stroke="#365314" strokeWidth="1" />
        <ellipse cx="21" cy="23.5" rx="2.6" ry="1.6" fill="#86efac" stroke="#365314" strokeWidth="1" />
        <path d="M25 16 q5 0.5 4 4.5" fill="none" stroke="#365314" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const Frog = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <ellipse cx="16" cy="17" rx="10" ry="8.5" fill="#4ade80" stroke="#166534" strokeWidth="1.2" />
        <circle cx="10.5" cy="10.5" r="3.4" fill="#4ade80" stroke="#166534" strokeWidth="1.2" />
        <circle cx="21.5" cy="10.5" r="3.4" fill="#4ade80" stroke="#166534" strokeWidth="1.2" />
        <circle cx="10.5" cy="10.5" r="1.6" fill="#ffffff" />
        <circle cx="21.5" cy="10.5" r="1.6" fill="#ffffff" />
        <circle cx="10.5" cy="10.5" r="0.8" fill="#2b1c0e" />
        <circle cx="21.5" cy="10.5" r="0.8" fill="#2b1c0e" />
        <circle cx="9.5" cy="19" r="1.7" fill="#f2a7b3" opacity="0.85" />
        <circle cx="22.5" cy="19" r="1.7" fill="#f2a7b3" opacity="0.85" />
        <path d="M13.5 18 q2.5 2.8 5 0" fill="none" stroke="#166534" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M11 24 q-2 2 -4 1 M21 24 q2 2 4 1" fill="none" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const Chameleon = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <path d="M6 19 q1 -9 12 -9 q8 0 10 4 q2 4 -1 5.5 q-6 2.5 -13 1 q-5 -1 -8 -1.5 Z" fill="#22c55e" stroke="#166534" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M25 9.5 q6 -0.5 5 6" fill="none" stroke="#166534" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="10.5" cy="13.5" r="2.7" fill="#ffffff" stroke="#166534" strokeWidth="1" />
        <circle cx="10.5" cy="13.5" r="1.3" fill="#2b1c0e" />
        <circle cx="14.5" cy="9" r="1.5" fill="#f87171" />
        <circle cx="18" cy="8.2" r="1.5" fill="#fbbf24" />
        <circle cx="21.5" cy="9" r="1.5" fill="#60a5fa" />
    </svg>
);

const Sloth = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <ellipse cx="16" cy="17.5" rx="10" ry="8.5" fill="#d6b98c" stroke="#8a6a3b" strokeWidth="1.2" />
        <circle cx="16" cy="12" r="6.5" fill="#d6b98c" stroke="#8a6a3b" strokeWidth="1.2" />
        <path d="M11 6.5 q-0.5 -3 2.5 -3.5 M21 6.5 q0.5 -3 -2.5 -3.5" fill="none" stroke="#8a6a3b" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="12.5" cy="12" rx="2.5" ry="3" fill="#4b3621" />
        <ellipse cx="19.5" cy="12" rx="2.5" ry="3" fill="#4b3621" />
        <path d="M11.5 12 h2 M18.5 12 h2" stroke="#f5e6d0" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M14 15.5 q2 1.2 4 0" fill="none" stroke="#8a6a3b" strokeWidth="1" strokeLinecap="round" />
        <ellipse cx="11.5" cy="21" rx="3" ry="2" fill="#d6b98c" stroke="#8a6a3b" strokeWidth="1" />
        <ellipse cx="20.5" cy="21" rx="3" ry="2" fill="#d6b98c" stroke="#8a6a3b" strokeWidth="1" />
    </svg>
);

const Owl = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <path d="M9.5 9.5 L7.5 3 L13 7.5 M22.5 9.5 L24.5 3 L19 7.5" fill="#a16207" stroke="#713f12" strokeWidth="1.2" strokeLinejoin="round" />
        <ellipse cx="16" cy="16.5" rx="9" ry="9" fill="#a16207" stroke="#713f12" strokeWidth="1.2" />
        <circle cx="11.5" cy="14" r="3.7" fill="#fef3c7" stroke="#713f12" strokeWidth="1" />
        <circle cx="20.5" cy="14" r="3.7" fill="#fef3c7" stroke="#713f12" strokeWidth="1" />
        <circle cx="11.5" cy="14" r="1.6" fill="#2b1c0e" />
        <circle cx="20.5" cy="14" r="1.6" fill="#2b1c0e" />
        <path d="M16 16.5 l0 2 M14.8 18.5 l2.4 0" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M13 21 q3 2 6 0" fill="none" stroke="#713f12" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
);

const SnakeMascot = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <path d="M8 23 q-1 -6 4 -8 q5 -2 5 -6 q0 -2 -2 -3" fill="none" stroke="#22c55e" strokeWidth="4.6" strokeLinecap="round" />
        <path d="M8 23 q-1 -6 4 -8 q5 -2 5 -6" fill="none" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <circle cx="15" cy="5.5" r="3.6" fill="#22c55e" stroke="#166534" strokeWidth="1.2" />
        <circle cx="16" cy="5" r="1.2" fill="#2b1c0e" />
        <path d="M18.5 4 q1.8 -1 1.5 -3" fill="none" stroke="#ef4444" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

const Bookworm = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <circle cx="9" cy="15.5" r="4.6" fill="#84cc16" stroke="#3f6212" strokeWidth="1.2" />
        <circle cx="15.5" cy="15.5" r="4.6" fill="#84cc16" stroke="#3f6212" strokeWidth="1.2" />
        <circle cx="22" cy="15.5" r="4.6" fill="#84cc16" stroke="#3f6212" strokeWidth="1.2" />
        <path d="M19.5 12.5 q-0.8 -2.6 1 -3.6 M24 12.5 q0.8 -2.6 -1 -3.6" fill="none" stroke="#3f6212" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="22" cy="15" r="2.4" fill="#ffffff" stroke="#3f6212" strokeWidth="0.9" />
        <circle cx="22" cy="15" r="1" fill="#2b1c0e" />
        <path d="M6 22.5 q-2 0 -2 -2 v-1.5 q0 -1.5 2 -1.5 M6 22.5 q2 0 2 -2 v-1.5 q0 -1.5 -2 -1.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" strokeLinejoin="round" />
    </svg>
);

// A mafia cat — fedora, whiskers, and a red tie — for Imposter MAFIA.
const MafiaCat = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <ellipse cx="16" cy="10" rx="12" ry="3" fill="#1f2937" stroke="#0b0f14" strokeWidth="1.2" />
        <path d="M10 9 q6 -7 12 0 q-1.2 2.6 -6 2.6 q-4.8 0 -6 -2.6 z" fill="#374151" stroke="#0b0f14" strokeWidth="1.2" />
        <path d="M10 11 q6 2.4 12 0" fill="none" stroke="#111827" strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="16" cy="18.5" rx="8" ry="6.5" fill="#8b5cf6" stroke="#4c2ea8" strokeWidth="1.2" />
        <path d="M9.5 14.5 l-2 -3.5 M12.5 13.5 l-1.5 -3 M22.5 14.5 l2 -3.5 M19.5 13.5 l1.5 -3" fill="#8b5cf6" stroke="#4c2ea8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12.5" cy="17.5" r="2" fill="#ffffff" stroke="#2b1c0e" strokeWidth="0.8" />
        <circle cx="19.5" cy="17.5" r="2" fill="#ffffff" stroke="#2b1c0e" strokeWidth="0.8" />
        <circle cx="12.5" cy="17.5" r="0.9" fill="#2b1c0e" />
        <circle cx="19.5" cy="17.5" r="0.9" fill="#2b1c0e" />
        <path d="M14.5 20.5 q1.5 1 3 0" fill="none" stroke="#2b1c0e" strokeWidth="1" strokeLinecap="round" />
        <path d="M16 20.5 l0 2.5 M14.5 22.5 l3 0" stroke="#2b1c0e" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M8 18.5 h-2 M8 20.5 h-2 M24 18.5 h2 M24 20.5 h2" stroke="#2b1c0e" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M13.5 24 l-1.5 1.5 M18.5 24 l1.5 1.5 M16 24 l0 1.5" fill="#ef4444" stroke="#991b1b" strokeWidth="0.9" strokeLinejoin="round" />
    </svg>
);

// A snail with an ink trail — slow, nostalgic, leaving its mark. For the Guestbook.
const Snail = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <circle cx="3.5" cy="22.5" r="0.9" fill="#c2874a" opacity="0.3" />
        <circle cx="6.3" cy="21.2" r="1.2" fill="#c2874a" opacity="0.5" />
        <path d="M9 20 q-3.5 2.5 -8.5 1.5" fill="none" stroke="#c2874a" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        <path d="M8 21.5 q6 4 13.5 0.8 q4.5 -2.2 3.5 -6.3" fill="#8fbf6b" stroke="#365314" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19.5" cy="13.5" r="8.5" fill="#d9a15c" stroke="#7a4a1f" strokeWidth="1.2" />
        <path d="M19.5 13.5 m-5.5 0 a5.5 5.5 0 0 1 5.5 -5.5" fill="none" stroke="#7a4a1f" strokeWidth="1" opacity="0.6" />
        <path d="M19.5 13.5 m-3 0 a3 3 0 0 1 3 -3" fill="none" stroke="#7a4a1f" strokeWidth="1" opacity="0.6" />
        <path d="M8.5 19 q-1.2 -4 1.3 -5.7" fill="none" stroke="#365314" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="10.3" cy="12.2" r="1.3" fill="#2b1c0e" />
        <path d="M6 19.5 q-1.2 -3.2 0.8 -4.8" fill="none" stroke="#365314" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="7.3" cy="14" r="1.2" fill="#2b1c0e" />
        <path d="M7 23 q2.2 1.4 4.6 0.3" fill="none" stroke="#365314" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

// A rabbit — warm and approachable, for the About Me introduction.
const Rabbit = ({ className = "" }) => (
    <svg viewBox="0 0 32 28" className={`title-mascot ${className}`} aria-hidden="true">
        <path d="M11 11 Q9 2 12.5 1 Q15 2 13.5 11 Z" fill="#f5f0ea" stroke="#8a8378" strokeWidth="1.1" />
        <path d="M19 11 Q21 2 17.5 1 Q15 2 16.5 11 Z" fill="#f5f0ea" stroke="#8a8378" strokeWidth="1.1" />
        <path d="M12 10.3 Q11 4.5 12.7 3.5 Q13.8 4.5 13 10.3 Z" fill="#f2b8c6" />
        <path d="M18 10.3 Q19 4.5 17.3 3.5 Q16.2 4.5 17 10.3 Z" fill="#f2b8c6" />
        <ellipse cx="16" cy="18" rx="10" ry="8.5" fill="#f5f0ea" stroke="#8a8378" strokeWidth="1.2" />
        <circle cx="12" cy="17" r="1.8" fill="#2b1c0e" />
        <circle cx="20" cy="17" r="1.8" fill="#2b1c0e" />
        <path d="M15 20.6 q1 1 2 0" fill="none" stroke="#8a8378" strokeWidth="1" strokeLinecap="round" />
        <path d="M16 19.6 q-0.8 0 -0.8 0.7 q0 0.8 0.8 0.8 q0.8 0 0.8 -0.8 q0 -0.7 -0.8 -0.7 Z" fill="#f2b8c6" />
        <path d="M9 20 l-4 -1 M9 21.5 l-4 0.8 M23 20 l4 -1 M23 21.5 l4 0.8" stroke="#8a8378" strokeWidth="0.6" strokeLinecap="round" />
    </svg>
);

export { Fox, Spider, Panda, Pigeon, Penguin, Turtle, Frog, Chameleon, Sloth, Owl, SnakeMascot, Bookworm, MafiaCat, Snail, Rabbit };

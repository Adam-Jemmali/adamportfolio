// Hand-styled inline SVGs for Imposter MAFIA — no icon libraries, drawn to
// match the AppMascots style (flat shapes, dark outlines, 18px-ish glyphs).

const MagnifierIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="6" fill="#c084fc" fillOpacity="0.18" stroke="#c084fc" strokeWidth="1.6" />
        <path d="M13.2 13.2 L18 18" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 8.5 q1 -2.4 3.5 -2.4" fill="none" stroke="#e9d5ff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const BustedIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <circle cx="6" cy="10" r="4.4" fill="none" stroke="#67e8f9" strokeWidth="1.8" />
        <circle cx="14" cy="10" r="4.4" fill="none" stroke="#67e8f9" strokeWidth="1.8" />
        <path d="M6 5.6 V3 M14 5.6 V3 M4.7 3 h2.6 M12.7 3 h2.6" stroke="#67e8f9" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const StreakIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <path d="M10 2.5 c1 3 -3 4 -3 7.5 a3.2 3.2 0 1 0 6.4 0 c0 -1.4 -0.8 -2.2 -1.2 -3 c0.6 1.6 -1.4 2 -1.4 3.6 a1.6 1.6 0 1 1 -3.2 0 c0 -3 3 -3.6 2.4 -8.1 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
);

const ReplayIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <path d="M4 10 a6 6 0 1 1 1.8 4.3" fill="none" stroke="#0b0f14" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 5.5 V10 H8.5" fill="none" stroke="#0b0f14" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RoundsIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <rect x="6" y="2.5" width="11" height="11" rx="2" fill="none" stroke="#67e8f9" strokeWidth="1.4" opacity="0.5" />
        <rect x="3.5" y="5" width="11" height="11" rx="2" fill="none" stroke="#67e8f9" strokeWidth="1.4" opacity="0.75" />
        <rect x="1" y="7.5" width="11" height="11" rx="2" fill="#0e7490" stroke="#67e8f9" strokeWidth="1.4" />
    </svg>
);

const BugIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <path d="M8 3.5 L6.5 2 M12 3.5 L13.5 2" stroke="#f87171" strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="10" cy="11" rx="5.5" ry="6.5" fill="#f87171" stroke="#7f1d1d" strokeWidth="1.2" />
        <path d="M10 6 v10" stroke="#7f1d1d" strokeWidth="1" />
        <path d="M4.7 8 l-2.7 -1 M4.7 11 h-3 M4.7 14 l-2.7 1 M15.3 8 l2.7 -1 M15.3 11 h3 M15.3 14 l2.7 1" stroke="#7f1d1d" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="10" cy="7" rx="2.6" ry="2.2" fill="#7f1d1d" />
    </svg>
);

const PythonIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <path d="M10 2.5 c-3.4 0 -3.2 1.5 -3.2 1.5 l0 1.6 h3.3 v0.5 H5.4 c0 0 -2.4 -0.3 -2.4 4 s2.1 4.1 2.1 4.1 h1.3 v-1.8 c0 0 -0.1 -2.1 2.1 -2.1 h3.2 c0 0 2 0 2 -1.9 v-3.4 c0 -1.9 -2 -2.5 -3.7 -2.5 Z" fill="#3b82f6" />
        <path d="M10 17.5 c3.4 0 3.2 -1.5 3.2 -1.5 l0 -1.6 h-3.3 v-0.5 h4.7 c0 0 2.4 0.3 2.4 -4 s-2.1 -4.1 -2.1 -4.1 h-1.3 v1.8 c0 0 0.1 2.1 -2.1 2.1 h-3.2 c0 0 -2 0 -2 1.9 v3.4 c0 1.9 2 2.5 3.7 2.5 Z" fill="#facc15" />
        <circle cx="7.6" cy="4.6" r="0.6" fill="#f4f4f5" />
        <circle cx="12.4" cy="15.4" r="0.6" fill="#f4f4f5" />
    </svg>
);

const JavaIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <path d="M6.5 13 q7 2 7.5 -0.3 q0.4 1.6 -2 2.6 q-4.6 1.4 -7.2 -0.4 q1.2 0.3 1.7 -1.9 Z" fill="#f87171" />
        <ellipse cx="10" cy="15.4" rx="5.6" ry="1.4" fill="none" stroke="#f87171" strokeWidth="1" />
        <path d="M9 3 q2.4 1.6 0.6 3.4 q-2.4 2.2 0.4 4.2" fill="none" stroke="#fb923c" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M7 11.5 h6" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const TypeScriptIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <rect x="2.5" y="2.5" width="15" height="15" rx="3" fill="#3b82f6" />
        <path d="M5.5 8.2 h4.2 M7.6 8.2 v6" stroke="#f4f4f5" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M11 13.6 q0.8 0.9 2 0.9 q1.4 0 1.4 -1 q0 -0.9 -1.4 -1.3 q-1.6 -0.5 -1.6 -1.6 q0 -1.1 1.5 -1.1 q1 0 1.6 0.6" fill="none" stroke="#f4f4f5" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const GoIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <ellipse cx="10" cy="11" rx="6.5" ry="5" fill="#67e8f9" />
        <circle cx="6.8" cy="9.6" r="1.4" fill="#0e7490" />
        <circle cx="13.2" cy="9.6" r="1.4" fill="#0e7490" />
        <circle cx="6.8" cy="9.6" r="0.5" fill="#f4f4f5" />
        <circle cx="13.2" cy="9.6" r="0.5" fill="#f4f4f5" />
        <path d="M6.5 4.2 L4.8 2.4 M13.5 4.2 L15.2 2.4" stroke="#0e7490" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

const CppIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`mafia-icon ${className}`} aria-hidden="true">
        <path d="M10 2.6 l6.5 3.7 v7.4 L10 17.4 l-6.5 -3.7 V6.3 Z" fill="#60a5fa" />
        <path d="M9.6 12.3 c-1.7 0 -2.9 -1.1 -2.9 -3 s1.2 -3 2.9 -3 c1 0 1.7 0.4 2.2 1" fill="none" stroke="#0b1220" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M13 8.4 v2.8 M11.7 9.8 h2.6" stroke="#0b1220" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M16 8.4 v2.8 M14.7 9.8 h2.6" stroke="#0b1220" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
);

export { MagnifierIcon, BustedIcon, StreakIcon, ReplayIcon, RoundsIcon, BugIcon, PythonIcon, JavaIcon, TypeScriptIcon, GoIcon, CppIcon };

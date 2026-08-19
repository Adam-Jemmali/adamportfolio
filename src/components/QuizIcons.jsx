// Hand-styled inline SVGs for the Dev Quiz category picker. No icon
// libraries — same flat, dark-outlined look as AppMascots and GameIcons.

const SystemDesignIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <path d="M6 6 L10 10 L14 6 M6 14 L10 10 L14 14" stroke="#67e8f9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="3.5" y="3.5" width="5" height="5" rx="1.2" fill="#0e7490" stroke="#67e8f9" strokeWidth="1" />
        <rect x="11.5" y="3.5" width="5" height="5" rx="1.2" fill="#0e7490" stroke="#67e8f9" strokeWidth="1" />
        <rect x="7.5" y="11.5" width="5" height="5" rx="1.2" fill="#0e7490" stroke="#67e8f9" strokeWidth="1" />
    </svg>
);

const FullStackIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <rect x="3" y="2.5" width="14" height="4" rx="1.2" fill="#67e8f9" />
        <rect x="3" y="8" width="14" height="4" rx="1.2" fill="#c084fc" />
        <rect x="3" y="13.5" width="14" height="4" rx="1.2" fill="#fbbf24" />
    </svg>
);

const CodingIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <path d="M7 5 L2.5 10 L7 15 M13 5 L17.5 10 L13 15" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M11.5 3.5 L8.5 16.5" stroke="#f4f4f5" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
);

const WebIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <circle cx="10" cy="10" r="7" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
        <ellipse cx="10" cy="10" rx="3" ry="7" fill="none" stroke="#60a5fa" strokeWidth="1.2" />
        <path d="M3 10 h14 M4.2 6 h11.6 M4.2 14 h11.6" stroke="#60a5fa" strokeWidth="1.2" />
    </svg>
);

const LanguageIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <path d="M3 4.5 h11 a2 2 0 0 1 2 2 v5 a2 2 0 0 1 -2 2 H9 l-3.5 3 v-3 H5 a2 2 0 0 1 -2 -2 v-5 a2 2 0 0 1 2 -2 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="1" strokeLinejoin="round" />
        <circle cx="6.6" cy="9.2" r="0.9" fill="#fff7ed" />
        <circle cx="10" cy="9.2" r="0.9" fill="#fff7ed" />
        <circle cx="13.4" cy="9.2" r="0.9" fill="#fff7ed" />
    </svg>
);

export { SystemDesignIcon, FullStackIcon, CodingIcon, WebIcon, LanguageIcon };

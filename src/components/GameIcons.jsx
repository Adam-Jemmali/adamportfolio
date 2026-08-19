// Small hand-styled inline SVGs shared across the arcade games (difficulty
// bars, the "all" mark). No icon libraries — same look as AppMascots.

const EasyIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <rect x="2.5" y="12" width="3.4" height="6" rx="1" fill="#4ade80" />
        <rect x="8.3" y="8" width="3.4" height="10" rx="1" fill="#4ade80" fillOpacity="0.35" />
        <rect x="14.1" y="4" width="3.4" height="14" rx="1" fill="#4ade80" fillOpacity="0.35" />
    </svg>
);

const NormalIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <rect x="2.5" y="12" width="3.4" height="6" rx="1" fill="#fbbf24" />
        <rect x="8.3" y="8" width="3.4" height="10" rx="1" fill="#fbbf24" />
        <rect x="14.1" y="4" width="3.4" height="14" rx="1" fill="#fbbf24" fillOpacity="0.35" />
    </svg>
);

const HardIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <rect x="2.5" y="12" width="3.4" height="6" rx="1" fill="#f87171" />
        <rect x="8.3" y="8" width="3.4" height="10" rx="1" fill="#f87171" />
        <rect x="14.1" y="4" width="3.4" height="14" rx="1" fill="#f87171" />
    </svg>
);

const AllIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <circle cx="6.5" cy="8" r="3.6" fill="#67e8f9" fillOpacity="0.85" />
        <circle cx="13" cy="12" r="3.6" fill="#c084fc" fillOpacity="0.85" />
    </svg>
);

export { EasyIcon, NormalIcon, HardIcon, AllIcon };

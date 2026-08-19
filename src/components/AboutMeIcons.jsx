// Hand-drawn icon for the About Me desktop tile — no icon libraries.

const AboutMeTileIcon = ({ className = "", strokeWidth = 1.6 }) => (
    <svg
        viewBox="0 0 24 24"
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="8.5" r="3.5" />
        <path d="M4.5 20 C4.5 15.5 7.8 13 12 13 C16.2 13 19.5 15.5 19.5 20" />
    </svg>
);

export { AboutMeTileIcon };

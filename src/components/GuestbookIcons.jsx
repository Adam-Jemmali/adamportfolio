// Hand-drawn icons for the Guestbook — no icon libraries.

// Flat, single-color (currentColor) open book + quill, sized to match the
// lucide-style icons already used for the other desktop tiles.
const GuestbookTileIcon = ({ className = "", strokeWidth = 1.6 }) => (
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
        <path d="M3 6 C6 4.6 9 4.6 11.5 6 V19 C9 17.6 6 17.6 3 19 Z" />
        <path d="M21 6 C18 4.6 15 4.6 12.5 6 V19 C15 17.6 18 17.6 21 19 Z" />
        <path d="M13 9.5 L18.5 4 L20.3 5.8 L14.8 11.3 Z" fill="currentColor" stroke="none" />
    </svg>
);

// Colored quill, for the sign-it button inside the Guestbook window.
const QuillIcon = ({ className = "" }) => (
    <svg viewBox="0 0 20 20" className={`game-icon ${className}`} aria-hidden="true">
        <path d="M16.5 2.5 C10.5 4.5 5.5 9.5 3.8 16 L3.2 17.5 L4.7 16.9 C11.2 15.2 16.2 10.2 18.2 4.2 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="1" strokeLinejoin="round" />
        <path d="M9.5 10.5 L4 16" stroke="#92400e" strokeWidth="1" strokeLinecap="round" />
        <circle cx="3.4" cy="17.1" r="0.9" fill="#0e7490" />
    </svg>
);

export { GuestbookTileIcon, QuillIcon };

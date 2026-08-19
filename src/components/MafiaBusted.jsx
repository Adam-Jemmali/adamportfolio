// Mafia's little animated scenes — the opening magnifier scan and the
// results-screen bust. Pure inline SVG + CSS keyframes, no libraries.
// Positioning uses SVG transform attributes on plain wrapper <g>s; the
// CSS-animated element is always an un-transformed child so the two
// transform systems never fight (SVG attr transform vs CSS transform).

const Star = ({ delay = "0s", x = 0, y = 0, scale = 1 }) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <path
            className="bust-star"
            style={{ animationDelay: delay }}
            d="M0,-7 L1.6,-1.6 L7,0 L1.6,1.6 L0,7 L-1.6,1.6 L-7,0 L-1.6,-1.6 Z"
            fill="#fbbf24"
        />
    </g>
);

const MafiaBustedScene = ({ className = "" }) => (
    <svg viewBox="0 0 260 150" className={`bust-scene ${className}`} aria-hidden="true">
        <ellipse cx="72" cy="136" rx="32" ry="6" fill="#000" opacity="0.35" />
        <ellipse cx="190" cy="138" rx="28" ry="6" fill="#000" opacity="0.35" />

        <g transform="translate(72 88)">
            <g className="bust-cat">
                <path d="M-22 -34 L-30 -50 L-14 -40 M22 -34 L30 -50 L14 -40" fill="#374151" stroke="#0b0f14" strokeWidth="1.6" strokeLinejoin="round" />
                <ellipse cx="0" cy="-38" rx="20" ry="7" fill="#1f2937" stroke="#0b0f14" strokeWidth="1.4" />
                <ellipse cx="0" cy="4" rx="26" ry="22" fill="#8b5cf6" stroke="#4c2ea8" strokeWidth="1.6" />
                <circle cx="-8" cy="0" r="4" fill="#fff" stroke="#0b0f14" strokeWidth="1" />
                <circle cx="8" cy="0" r="4" fill="#fff" stroke="#0b0f14" strokeWidth="1" />
                <path d="M-11 -3 L-5 3 M-5 -3 L-11 3 M5 -3 L11 3 M11 -3 L5 3" stroke="#0b0f14" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M-5 8 q5 4 10 0" fill="none" stroke="#0b0f14" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M-8 22 l-5 5 M8 22 l5 5 M0 22 l0 6" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
            </g>
        </g>

        <g transform="translate(72 60)">
            <Star delay="0s" x={-4} y={-6} scale={0.55} />
            <Star delay="0.25s" x={16} y={2} scale={0.45} />
            <Star delay="0.5s" x={2} y={12} scale={0.5} />
        </g>

        <g transform="translate(198 92)">
            <path d="M-4 -46 q10 -8 20 0 q-2 4 -10 4 q-8 0 -10 -4 z" fill="#334155" stroke="#0b0f14" strokeWidth="1.6" />
            <ellipse cx="6" cy="-44" rx="16" ry="4" fill="#1e293b" stroke="#0b0f14" strokeWidth="1.4" />
            <circle cx="6" cy="-34" r="10" fill="#e8b98a" stroke="#0b0f14" strokeWidth="1.4" />
            <rect x="-8" y="-24" width="28" height="34" rx="8" fill="#475569" stroke="#0b0f14" strokeWidth="1.6" />
            <path d="M-8 -14 l-10 4 M20 -14 l10 4" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />

            <g transform="translate(-8 -14)">
                <g className="bust-arm">
                    <path d="M0 0 L-32 -6" stroke="#e8b98a" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="-40" cy="-8" r="11" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <path d="M-31 1 L-24 8" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                </g>
            </g>
        </g>

        <g transform="translate(128 72)">
            <Star delay="0s" x={0} y={0} scale={1.3} />
            <Star delay="0.05s" x={10} y={-8} scale={0.8} />
            <Star delay="0.1s" x={-9} y={6} scale={0.7} />
        </g>
    </svg>
);

// Opening scene: a magnifying glass sweeps over a few lines of code,
// hunting for the one line tinted red — the imposter waiting to be found.
const MafiaReadyScene = ({ className = "" }) => (
    <svg viewBox="0 0 200 90" className={`mafia-ready-scene ${className}`} aria-hidden="true">
        <rect x="20" y="18" width="120" height="10" rx="5" fill="#fff" opacity="0.12" />
        <rect x="20" y="40" width="150" height="10" rx="5" fill="#ef4444" opacity="0.28" />
        <rect x="20" y="62" width="90" height="10" rx="5" fill="#fff" opacity="0.12" />

        <g transform="translate(30 45)">
            <g className="mafia-ready-glass">
                <circle cx="0" cy="0" r="16" fill="#c084fc" fillOpacity="0.12" stroke="#c084fc" strokeWidth="2.2" />
                <path d="M11.3 11.3 L21 21" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
            </g>
        </g>
    </svg>
);

export { MafiaBustedScene, MafiaReadyScene };

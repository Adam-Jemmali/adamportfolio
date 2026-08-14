const LETTERS = [
    { value: "A", monogram: true },
    { value: "d" },
    { value: "a" },
    { value: "m" },
    { value: " " },
    { value: "J", monogram: true },
    { value: "e" },
    { value: "m" },
    { value: "m" },
    { value: "a" },
    { value: "l" },
    { value: "i" },
];

const BrandName = ({ className = "", animated = false }) => (
    <span className={`brand-name ${className}`.trim()} aria-label="Adam Jemmali">
        {LETTERS.map(({ value, monogram }, index) => (
            <span
                key={`${value}-${index}`}
                className={`brand-name-letter${monogram ? " brand-monogram" : ""}${animated ? " hero-letter" : ""}`}
                style={animated ? { "--letter-delay": `${0.24 + index * 0.055}s` } : undefined}
                aria-hidden="true"
            >
                {value === " " ? "\u00A0" : value}
            </span>
        ))}
    </span>
);

export default BrandName;

import { useEffect, useRef } from "react";

const PROFILE_SNAKE_BLOCKS = Array.from({ length: 13 }, (_, i) => ({
    size: 12 + ((i * 7) % 12),
    opacity: 0.42 + ((i % 4) * 0.13),
}));

function ProfileSnakeBlocks() {
    const railRef = useRef(null);
    const blockRefs = useRef([]);

    useEffect(() => {
        const rail = railRef.current;
        if (!rail) return;

        const points = PROFILE_SNAKE_BLOCKS.map((_, i) => ({
            x: rail.clientWidth * 0.48,
            y: 36 + i * 25,
        }));
        const target = { x: points[0].x, y: points[0].y };
        let last = performance.now();

        const onMove = (event) => {
            const rect = rail.getBoundingClientRect();
            target.x = Math.max(18, Math.min(rect.width - 18, event.clientX - rect.left));
            target.y = Math.max(28, Math.min(rect.height - 36, event.clientY - rect.top));
        };

        const tick = () => {
            const now = performance.now();
            const dt = Math.min((now - last) / 1000, 0.08);
            last = now;
            const headEase = 1 - Math.pow(0.0008, dt);
            points[0].x += (target.x - points[0].x) * headEase;
            points[0].y += (target.y - points[0].y) * headEase;

            for (let i = 1; i < points.length; i++) {
                const previous = points[i - 1];
                const point = points[i];
                const dx = previous.x - point.x;
                const dy = previous.y - point.y;
                const distance = Math.hypot(dx, dy) || 1;
                const gap = 20 + i * 1.5;
                if (distance > gap) {
                    const desiredX = previous.x - (dx / distance) * gap;
                    const desiredY = previous.y - (dy / distance) * gap;
                    const ease = 1 - Math.pow(0.0001, dt);
                    point.x += (desiredX - point.x) * ease;
                    point.y += (desiredY - point.y) * ease;
                }
            }

            points.forEach((point, i) => {
                const block = blockRefs.current[i];
                if (!block) return;
                const item = PROFILE_SNAKE_BLOCKS[i];
                const pulse = 1 + Math.sin(now / 260 + i * 0.7) * 0.08;
                block.style.transform = `translate3d(${(point.x - item.size / 2).toFixed(1)}px, ${(point.y - item.size / 2).toFixed(1)}px, 0) scale(${pulse.toFixed(3)})`;
            });
        };

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("mousemove", onMove, { passive: true });
        const interval = setInterval(tick, 16);
        tick();
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("mousemove", onMove);
            clearInterval(interval);
        };
    }, []);

    return (
        <div ref={railRef} className="profile-template-snake" aria-hidden="true">
            <div className="profile-template-snake-field" />
            {PROFILE_SNAKE_BLOCKS.map((block, i) => (
                <span
                    key={i}
                    ref={(element) => { blockRefs.current[i] = element; }}
                    className="profile-template-snake-block"
                    style={{ width: block.size, height: block.size, opacity: block.opacity }}
                />
            ))}
        </div>
    );
}

export default function ProfilePanel() {
    return (
        <div className="profile-template">
            <div className="profile-template-content">
                <div className="profile-template-identity">
                    <span className="profile-template-signature">madaj.builds</span>
                    <div className="profile-template-photo-wrap">
                        <img
                            className="profile-template-photo"
                            src="/madaj-profile.png"
                            alt="Madaj Builds"
                        />
                    </div>
                </div>
                <div className="profile-template-copy">
                    <p className="profile-template-lede">
                        I explore how to shape AI-era<br />
                        workflows — building tools that sit at the<br />
                        intersection of code, craft, and systems<br />
                        thinking.
                    </p>
                    <p className="profile-template-secondary">
                        Currently building at{" "}
                        <a href="https://madaj.builds" target="_blank" rel="noopener noreferrer">
                            madaj.builds
                        </a>
                    </p>
                </div>
            </div>
            <ProfileSnakeBlocks />
        </div>
    );
}

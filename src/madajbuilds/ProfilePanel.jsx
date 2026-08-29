import { useEffect, useRef, useState } from "react";

export default function ProfilePanel() {
    const templateRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const template = templateRef.current;
        if (!template) return;
        if (!("IntersectionObserver" in window)) {
            const timer = window.setTimeout(() => setIsVisible(true), 0);
            return () => window.clearTimeout(timer);
        }

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.25 }
        );
        observer.observe(template);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={templateRef} className={`profile-template ${isVisible ? "profile-template-visible" : ""}`}>
            <div className="profile-template-content">
                <div className="profile-template-identity">
                    <span className="profile-template-signature">madaj.builds</span>
                    <div className="profile-template-photo-wrap">
                        <img
                            className="profile-template-photo"
                            src="/madaj-profile.png"
                            alt="Madaj Builds"
                        />
                        <div className="profile-photo-shimmer" aria-hidden="true" />
                    </div>
                </div>
                <div className="profile-template-copy">
                    <p className="profile-template-lede">
                        I&apos;m{" "}
                        <span className="profile-template-brand">madajbuilds</span>{" "}
                        building at the intersection of AI, sports tech, and gamified edtech. Through{" "}
                        <a
                            className="profile-template-handle"
                            href="https://www.instagram.com/madajbuilds/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            @madajbuilds
                        </a>{" "}
                        I share the code, systems, and free resources behind everything I create.
                    </p>
                </div>
            </div>
        </div>
    );
}

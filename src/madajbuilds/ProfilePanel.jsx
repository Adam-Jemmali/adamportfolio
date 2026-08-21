/**
 * Profile panel that replaces "SHIP WITH MOMENTUM".
 * Left: profile photo with cursive "madaj.builds" overlay + light slice.
 * Right: large bold bio text.
 */
export default function ProfilePanel() {
    return (
        <div className="profile-panel">
            <div className="profile-photo-wrap">
                <div className="profile-photo">
                    <img
                        src="/madaj/profile.jpg"
                        alt="Madaj"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />
                </div>
                <span className="profile-cursive">madaj.builds</span>
                <div className="profile-sunlight" aria-hidden="true" />
                <div className="profile-light-slice" aria-hidden="true" />
            </div>
            <div className="profile-text">
                <p className="profile-bio">
                    I explore how to shape AI-era workflows — building tools
                    that sit at the intersection of code, craft, and systems
                    thinking.
                </p>
                <p className="profile-sub">
                    Currently building at{" "}
                    <a href="https://madaj.builds" target="_blank" rel="noopener noreferrer">
                        madaj.builds
                    </a>
                </p>
            </div>
        </div>
    );
}

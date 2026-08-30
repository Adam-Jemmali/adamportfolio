import WindowsControls from "#components/WindowsControls.jsx";
import { Rabbit } from "#components/AppMascots.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";

const AboutMe = () => {
    const { openWindow, focusWindow } = useWindowStore();
    const open = (id) => {
        openWindow(id);
        focusWindow(id);
    };

    return (
        <>
            <div id="window-header">
                <WindowsControls target="aboutme" />
                <h2><Rabbit />About Me</h2>
            </div>

            <div className="aboutme-body">
                <div className="aboutme-photo-block">
                    <div className="aboutme-photo-wrap">
                        <img src="/public/images/adam_Me.png" alt="Adam Jemmali" className="aboutme-photo" />
                        <div className="aboutme-photo-shimmer" aria-hidden="true" />
                    </div>
                </div>
                <h3 className="aboutme-name">Adam Jemmali</h3>
                <p className="aboutme-title">ML Systems &amp; AI Automation &middot; Aspiring AI Engineer</p>

                <p className="aboutme-what">
                    <b>What I do:</b> I build machine-learning systems and AI automation,
                    then ship them as real products, backend to UI, not just notebooks.
                    Mostly around sports and edtech, always in public.
                </p>

                <div className="aboutme-actions">
                    <button type="button" className="aboutme-btn" onClick={() => open("resume")}>
                        View resume
                    </button>
                    <button type="button" className="aboutme-btn ghost" onClick={() => open("contact")}>
                        Get in touch
                    </button>
                </div>
            </div>
        </>
    );
};

const AboutMeWindow = WindowWrapper(AboutMe, "aboutme");
export default AboutMeWindow;

import WindowsControls from "#components/WindowsControls.jsx";
import { Rabbit } from "#components/AppMascots.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";

const FOCUS_AREAS = [
    "Real-time computer vision for sports analytics",
    "Agentic AI systems, designed to actually ship",
    "Full-stack SaaS, backend to UI",
];

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
                <img src="/public/images/adam_Me.png" alt="Adam Jemmali" className="aboutme-photo" />
                <h3 className="aboutme-name">Adam Jemmali</h3>
                <p className="aboutme-title">Computer Vision &amp; AI Systems Engineer</p>

                <p className="aboutme-what">
                    <b>What I do:</b> I build real-time computer vision pipelines and agentic
                    AI systems, then ship them as full products, backend to UI, not just
                    notebooks.
                </p>

                <ul className="aboutme-focus">
                    {FOCUS_AREAS.map((f) => (
                        <li key={f}>{f}</li>
                    ))}
                </ul>

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

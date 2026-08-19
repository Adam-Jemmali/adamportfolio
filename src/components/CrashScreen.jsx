import { useEffect } from "react";
import useSystemStore from "#store/system.js";

// A tongue-in-cheek "blue screen of death" — triggered by a hidden terminal
// easter egg (try `sudo rm -rf /`). Any key or click recovers to the desktop.
const CrashScreen = () => {
    const recover = useSystemStore((s) => s.recover);

    useEffect(() => {
        window.addEventListener("keydown", recover);
        window.addEventListener("click", recover);
        return () => {
            window.removeEventListener("keydown", recover);
            window.removeEventListener("click", recover);
        };
    }, [recover]);

    return (
        <section className="crash-screen">
            <span className="crash-badge">AJ OS</span>

            <div className="crash-body">
                <p>A fatal exception <b>0xAJ</b> has occurred at <b>ADAM:JEMMALI</b>.</p>
                <p>
                    The current process has been terminated. Any doubts about hiring Adam
                    were also terminated, out of an abundance of caution.
                </p>
                <p>AJ_OS is scanning your taste level… taste level: <b>excellent</b>.</p>
                <p className="crash-hint">* Press any key or click to return to the desktop.</p>
                <p className="crash-hint">* Or just reach out — this is the only crash you'll get.</p>
            </div>

            <span className="crash-cursor">_</span>
        </section>
    );
};

export default CrashScreen;

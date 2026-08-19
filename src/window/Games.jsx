import { Gamepad2, Keyboard, Terminal } from "lucide-react";
import WindowsControls from "#components/WindowsControls.jsx";
import { Frog } from "#components/AppMascots.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";

const Games = () => {
    const { openWindow, focusWindow } = useWindowStore();

    const launch = (key) => {
        openWindow(key);
        focusWindow(key);
    };

    return (
        <>
            <div id="window-header">
                <WindowsControls target="games" />
                <h2><Frog />Games</h2>
            </div>

            <div className="games-body">
                <button type="button" className="game-card" onClick={() => launch("snake")}>
                    <span className="game-icon"><Gamepad2 size={28} /></span>
                    <h3>Snake</h3>
                    <p>Classic arcade. Don't crash.</p>
                </button>

                <button type="button" className="game-card" onClick={() => launch("code")}>
                    <span className="game-icon"><Keyboard size={28} /></span>
                    <h3>Code Racer</h3>
                    <p>Type real code. Learn. Go fast.</p>
                </button>

                <button type="button" className="game-card" onClick={() => launch("popquiz")}>
                    <span className="game-icon"><Terminal size={28} /></span>
                    <h3>Dev Quiz</h3>
                    <p>System design, code &amp; full stack.</p>
                </button>
            </div>
        </>
    );
};

const GamesWindow = WindowWrapper(Games, "games");
export default GamesWindow;

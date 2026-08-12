import { Gamepad2, Keyboard } from "lucide-react";
import WindowsControls from "#components/WindowsControls.jsx";
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
                <h2>Games</h2>
            </div>

            <div className="games-body">
                <button type="button" className="game-card" onClick={() => launch("snake")}>
                    <span className="game-icon"><Gamepad2 size={28} /></span>
                    <h3>Snake</h3>
                    <p>Classic arcade — don't crash.</p>
                </button>

                <button type="button" className="game-card" onClick={() => launch("code")}>
                    <span className="game-icon"><Keyboard size={28} /></span>
                    <h3>Code Racer</h3>
                    <p>Type real code. Learn. Go fast.</p>
                </button>
            </div>
        </>
    );
};

const GamesWindow = WindowWrapper(Games, "games");
export default GamesWindow;

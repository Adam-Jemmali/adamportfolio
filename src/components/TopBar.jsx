import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Sun, UserRound, Volume2, Wifi } from "lucide-react";
import { navLinks } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import useSystemStore from "#store/system.js";
import PowerMenu from "./PowerMenu.jsx";

const TopBar = () => {
    const { openWindow, focusWindow } = useWindowStore();
    const restart = useSystemStore((s) => s.restart);
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
        const id = setInterval(() => setTime(dayjs()), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <header id="topbar">
            <div className="topbar-left">
                <button type="button" className="topbar-logo" onClick={restart} title="Restart">
                    <img src="/public/icons/AJ.svg" alt="AJ" />
                </button>
                <nav>
                    {navLinks.map(({ id, name, type }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => {
                                openWindow(type);
                                focusWindow(type);
                            }}
                        >
                            {name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="topbar-right">
                <Wifi size={15} aria-label="Wi-Fi" />
                <Volume2 size={15} aria-label="Sound" />
                <Sun size={15} aria-label="Display" />
                <UserRound size={15} aria-label="User" />
                <span className="topbar-clock">{time.format("ddd MMM D  h:mm A")}</span>
                <PowerMenu />
            </div>
        </header>
    );
};

export default TopBar;

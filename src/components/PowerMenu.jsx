import { createElement, useEffect, useRef, useState } from "react";
import { Lock, LogOut, Moon, Power, RotateCw } from "lucide-react";
import useSystemStore from "#store/system.js";
import useWindowStore from "#store/window.js";

const ACTIONS = [
    { id: "suspend", label: "Suspend", icon: Moon },
    { id: "lock", label: "Lock", icon: Lock },
    { id: "logout", label: "Log Out", icon: LogOut },
    { id: "restart", label: "Restart", icon: RotateCw },
];

const PowerMenu = () => {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    const suspend = useSystemStore((s) => s.suspend);
    const lock = useSystemStore((s) => s.lock);
    const restart = useSystemStore((s) => s.restart);
    const closeAllWindows = useWindowStore((s) => s.closeAllWindows);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    const handle = (id) => {
        setOpen(false);
        if (id === "suspend") return suspend();
        if (id === "lock") return lock();
        if (id === "logout") {
            closeAllWindows();
            return lock();
        }
        if (id === "restart") {
            closeAllWindows();
            return restart();
        }
    };

    return (
        <div ref={wrapRef} className="power-menu-wrap">
            <button
                type="button"
                className="topbar-action"
                title="Power"
                aria-label="Power options"
                onClick={() => setOpen((o) => !o)}
            >
                <Power size={15} />
            </button>

            {open && (
                <ul className="power-menu">
                    {ACTIONS.map(({ id, label, icon }) => (
                        <li key={id}>
                            <button type="button" onClick={() => handle(id)}>
                                {createElement(icon, { size: 15 })}
                                <span>{label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PowerMenu;

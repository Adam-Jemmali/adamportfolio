import { useRef } from "react";
import { Tooltip } from "react-tooltip";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { dockApps } from "#constants/index.js";
import useWindowStore from "#store/window.js";

const Dock = () => {
    const bariconsRef = useRef(null);
    const { openWindow, focusWindow, windows, restoreWindow, focusedWindow } = useWindowStore();

    useGSAP(() => {
        const dock = bariconsRef.current;
        if (!dock) return;

        const icons = dock.querySelectorAll(".dock-icon");

        const animateIcons = (mouseX) => {
            const { left } = dock.getBoundingClientRect();

            icons.forEach((icon) => {
                const { left: iconLeft, width } = icon.getBoundingClientRect();
                const center = iconLeft - left + width / 2;
                const distance = Math.abs(mouseX - center);
                const intensity = Math.exp(-(distance ** 2) / 20000);

                gsap.to(icon, {
                    scale: 1 + 0.5 * intensity,
                    y: -15 * intensity,
                    duration: 0.2,
                    ease: "power1.out",
                });
            });
        };

        const handleMouseMove = (e) => {
            const { left } = dock.getBoundingClientRect();
            animateIcons(e.clientX - left);
        };

        const resetIcons = () => {
            icons.forEach((icon) => {
                gsap.killTweensOf(icon);
                gsap.to(icon, { scale: 1, y: 0, duration: 0.1, ease: "power1.out" });
            });
        };

        dock.addEventListener("mousemove", handleMouseMove);
        dock.addEventListener("mouseleave", resetIcons);

        return () => {
            dock.removeEventListener("mousemove", handleMouseMove);
            dock.removeEventListener("mouseleave", resetIcons);
        };
    }, []);

    const toggleApp = (app) => {
        if (!app.canOpen) return;

        const win = windows[app.id];
        if (!win?.isOpen) {
            openWindow(app.id);
            focusWindow(app.id);
            return;
        }
        if (win.minimized) {
            restoreWindow(app.id);
            return;
        }
        if (focusedWindow !== app.id) focusWindow(app.id);
    };

    return (
        <div id="dock">
            <div ref={bariconsRef} className="dock-container">
                {dockApps.map(({ id, name, icon, canOpen }) => (
                    <div key={id} className="relative flex justify-center">
                        <button
                            type="button"
                            className="dock-icon"
                            aria-label={name}
                            data-tooltip-id="dock-tooltip"
                            data-tooltip-delay-show={150}
                            data-tooltip-content={name}
                            disabled={!canOpen}
                            onClick={() => toggleApp({ id, canOpen })}
                        >
                            <img src={icon} alt={name} loading="lazy" className={canOpen ? "" : "opacity-50"} />
                        </button>
                        {windows[id]?.isOpen && <span className="dock-dot" />}
                    </div>
                ))}
                <Tooltip id="dock-tooltip" place="top" className="tooltip" />
            </div>
        </div>
    );
};

export default Dock;

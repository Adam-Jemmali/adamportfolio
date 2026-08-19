import { createElement, useRef } from "react";
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
                {dockApps.map(({ id, name, icon, canOpen, tile, glow }) => (
                    <div key={id} className="dock-item">
                        <button
                            type="button"
                            className="dock-icon"
                            aria-label={name}
                            disabled={!canOpen}
                            onClick={() => toggleApp({ id, canOpen })}
                        >
                            <span
                                className={`dock-icon-badge ${canOpen ? "" : "opacity-50"}`}
                                style={{ background: tile, "--glow": glow }}
                            >
                                {typeof icon === "string"
                                    ? <img src={icon} alt={name} loading="lazy" />
                                    : createElement(icon, {})
                                }
                            </span>
                        </button>
                        <span className="dock-label" role="tooltip">{name}</span>
                        {windows[id]?.isOpen && <span className="dock-dot" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dock;

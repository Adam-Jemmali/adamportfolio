import React, { createElement, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Check, Palette } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { desktopApps, wallpapers } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import useSystemStore from "#store/system.js";

gsap.registerPlugin(Draggable);

const Home = () => {
    const { openWindow, focusWindow } = useWindowStore();
    const containerRef = useRef(null);
    const menuRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);
    const [menu, setMenu] = useState(null); // { x, y }

    const wallpaper = useSystemStore((s) => s.wallpaper);
    const setWallpaper = useSystemStore((s) => s.setWallpaper);

    // Exactly these apps on the desktop — no folders, no duplicates of the dock.
    const DESKTOP_APP_IDS = ["web", "gallery", "contact", "skills", "journey", "games", "kidpix"];

    const items = DESKTOP_APP_IDS
        .map((id) => desktopApps.find((app) => app.id === id))
        .filter(Boolean)
        .map((app) => ({
            id: `app-${app.id}`,
            name: app.name,
            kind: "app",
            app,
            open: () => {
                openWindow(app.appId);
                focusWindow(app.appId);
            },
        }));

    const leftItems = items.slice(0, 3);
    const rightItems = items.slice(3);

    const renderItem = (item) => (
        <div
            key={item.id}
            data-id={item.id}
            className={clsx(
                "desktop-item group pointer-events-auto",
                selectedId === item.id && "selected"
            )}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedId(item.id);
            }}
            onDoubleClick={() => item.open()}
            onContextMenu={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSelectedId(item.id);
                setMenu({ x: e.clientX, y: e.clientY });
            }}
            title={item.name}
        >
            <span className="desktop-app-icon" style={{ background: item.app.tile }}>
                {typeof item.app.icon === "string" ? (
                    <img src={item.app.icon} alt={item.app.name} />
                ) : (
                    createElement(item.app.icon, { strokeWidth: 1.6 })
                )}
            </span>
            <p className="desktop-label">{item.name}</p>
        </div>
    );

    useGSAP(() => {
        Draggable.create(".desktop-item", {
            bounds: containerRef.current,
            onPress: function () {
                const id = this.target.getAttribute("data-id");
                setSelectedId(id);
            },
        });
    }, { scope: containerRef });

    // Close the context menu on any outside interaction.
    useEffect(() => {
        if (!menu) return;

        const onMouseDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(null);
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") setMenu(null);
        };

        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [menu]);

    const handleBackgroundClick = () => {
        setSelectedId(null);
        setMenu(null);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setSelectedId(null);
        setMenu({ x: e.clientX, y: e.clientY });
    };

    return (
        <section
            id="home"
            ref={containerRef}
            className="absolute inset-0 pt-20 pb-8 pl-6 pr-6 select-none pointer-events-none"
            onClick={handleBackgroundClick}
            onContextMenu={handleContextMenu}
        >
            <div className="flex justify-between h-[calc(100dvh-15rem)] pointer-events-none">
                <div className="flex flex-col flex-wrap gap-1 items-start content-start max-w-[12rem] h-full pointer-events-none">
                    {leftItems.map(renderItem)}
                </div>
                <div className="flex flex-col flex-wrap gap-1 items-end content-end max-w-[12rem] h-full pointer-events-none">
                    {rightItems.map(renderItem)}
                </div>
            </div>

            {menu && (
                <div
                    ref={menuRef}
                    className="desktop-menu pointer-events-auto"
                    style={{ left: menu.x, top: menu.y }}
                >
                    <p className="desktop-menu-title">
                        <Palette size={13} />
                        Wallpaper
                    </p>
                    {wallpapers.map((wp) => (
                        <button
                            key={wp.id}
                            type="button"
                            className="desktop-menu-item"
                            onClick={() => {
                                setWallpaper(wp.id);
                                setMenu(null);
                            }}
                        >
                            <span className="desktop-menu-swatch" style={{ background: wp.value }} />
                            <span className="flex-1 text-left">{wp.name}</span>
                            {wallpaper === wp.id && <Check size={14} className="text-green-400" />}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Home;

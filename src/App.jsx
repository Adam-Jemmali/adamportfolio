import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import TopBar from "#components/TopBar.jsx";
import Dock from "#components/Dock.jsx";
import Welcome from "#components/Welcome.jsx";
import Home from "#components/Home.jsx";
import Spotlight from "#components/Spotlight.jsx";
import LoadingScreen from "#components/LoadingScreen.jsx";
import LockScreen from "#components/LockScreen.jsx";
import SuspendScreen from "#components/SuspendScreen.jsx";
import { Terminal, Finder, Text, Image, Safari, Resume, Contact, Gallery, Snake, Games, Code, Journey } from "#window/index.js";
import { wallpapers } from "#constants/index.js";
import useSystemStore from "#store/system.js";
import useWindowStore from "#store/window.js";

gsap.registerPlugin(Draggable);

const App = () => {
    const screen = useSystemStore((s) => s.screen);
    const bootDone = useSystemStore((s) => s.bootDone);
    const brightness = useSystemStore((s) => s.brightness);
    const wallpaper = useSystemStore((s) => s.wallpaper);
    const desktopRef = useRef(null);
    const windows = useWindowStore((s) => s.windows);
    const focusedWindow = useWindowStore((s) => s.focusedWindow);
    const focusWindow = useWindowStore((s) => s.focusWindow);

    // Apply the selected wallpaper to the body background.
    useEffect(() => {
        const wp = wallpapers.find((w) => w.id === wallpaper) || wallpapers[0];
        document.body.style.backgroundImage = wp.type === "gradient" ? wp.value : `url("${wp.value}")`;
    }, [wallpaper]);

    // On phones, swipe across a window's content to move through open apps.
    // Headers remain dedicated to dragging and controls/inputs remain untouched.
    useEffect(() => {
        if (screen !== "desktop" || !desktopRef.current) return;

        const media = window.matchMedia("(max-width: 640px)");
        if (!media.matches) return;

        let start = null;
        const ignored = "button, input, textarea, select, a, [role='button'], #topbar, #dock, #window-header";

        const onPointerDown = (event) => {
            if (event.pointerType === "mouse") return;
            if (!(event.target instanceof Element) || event.target.closest(ignored)) return;
            start = { x: event.clientX, y: event.clientY };
        };

        const onPointerUp = (event) => {
            if (!start) return;
            const deltaX = event.clientX - start.x;
            const deltaY = event.clientY - start.y;
            start = null;

            if (Math.abs(deltaX) < 72 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;

            const openWindows = Object.entries(windows)
                .filter(([, win]) => win.isOpen && !win.minimized)
                .sort(([, a], [, b]) => b.zIndex - a.zIndex);
            if (openWindows.length < 2) return;

            const currentIndex = Math.max(
                openWindows.findIndex(([key]) => key === focusedWindow),
                0
            );
            const direction = deltaX < 0 ? 1 : -1;
            const nextIndex = (currentIndex + direction + openWindows.length) % openWindows.length;
            const [nextKey] = openWindows[nextIndex];
            focusWindow(nextKey);
        };

        const onPointerCancel = () => {
            start = null;
        };

        const root = desktopRef.current;
        root.addEventListener("pointerdown", onPointerDown);
        root.addEventListener("pointerup", onPointerUp);
        root.addEventListener("pointercancel", onPointerCancel);
        return () => {
            root.removeEventListener("pointerdown", onPointerDown);
            root.removeEventListener("pointerup", onPointerUp);
            root.removeEventListener("pointercancel", onPointerCancel);
        };
    }, [screen, windows, focusedWindow, focusWindow]);

    useGSAP(() => {
        if (screen === "desktop" && desktopRef.current) {
            gsap.fromTo(
                desktopRef.current,
                { opacity: 0, scale: 1.02 },
                { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [screen]);

    if (screen === "boot" || screen === "restarting") {
        return (
            <LoadingScreen
                title={screen === "restarting" ? "Restarting…" : "System Initialize"}
                onComplete={bootDone}
            />
        );
    }
    if (screen === "suspend") return <SuspendScreen />;
    if (screen === "lock") return <LockScreen />;

    return (
        <main ref={desktopRef}>
            {/* Brightness dim overlay (lives above the desktop but below the topbar/dock) */}
            <div
                className="brightness-overlay"
                aria-hidden="true"
                style={{ opacity: (100 - brightness) / 100 * 0.85 }}
            />
            <TopBar />
            <Welcome />
            <Home />
            <Terminal />
            <Safari />
            <Resume />
            <Finder />
            <Text />
            <Image />
            <Contact />
            <Gallery />
            <Snake />
            <Games />
            <Code />
            <Journey />
            <Spotlight />
            <Dock />
        </main>
    );
};

export default App;

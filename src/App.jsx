import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import TopBar from "#components/TopBar.jsx";
import Dock from "#components/Dock.jsx";
import Welcome from "#components/Welcome.jsx";
import Home from "#components/Home.jsx";
import LoadingScreen from "#components/LoadingScreen.jsx";
import LockScreen from "#components/LockScreen.jsx";
import SuspendScreen from "#components/SuspendScreen.jsx";
import { Terminal, Finder, Text, Image, Safari, Resume, Contact, Gallery, Snake, Games, Code } from "#window/index.js";
import useSystemStore from "#store/system.js";

gsap.registerPlugin(Draggable);

const App = () => {
    const screen = useSystemStore((s) => s.screen);
    const bootDone = useSystemStore((s) => s.bootDone);
    const brightness = useSystemStore((s) => s.brightness);
    const desktopRef = useRef(null);

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
            <Dock />
        </main>
    );
};

export default App;

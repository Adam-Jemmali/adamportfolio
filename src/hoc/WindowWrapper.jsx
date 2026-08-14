import useWindowStore from "#store/window.js";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const WindowWrapper = (Component, windowKey) => {
    const Wrapped = (props) => {
        const { focusWindow, windows, focusedWindow } = useWindowStore();
        const ref = useRef(null);

        const windowState = windows[windowKey];
        const isOpen = windowState?.isOpen;
        const isMinimized = windowState?.minimized;
        const isMaximized = windowState?.maximized;
        const zIndex = windowState?.zIndex ?? 0;
        const isFocused = focusedWindow === windowKey;

        // Entrance / restore animation
        useGSAP(() => {
            if (!isOpen || isMinimized || !ref.current) return;

            gsap.fromTo(
                ref.current,
                { opacity: 0, scale: 0.96, y: 16 },
                { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "power2.out" }
            );
        }, [isOpen, isMinimized]);

        // Drag by the header (disabled while maximized)
        useGSAP(() => {
            if (!isOpen || isMinimized || isMaximized || !ref.current) return;

            const header = ref.current.querySelector("#window-header");
            if (!header) return;

            const draggable = Draggable.create(ref.current, {
                trigger: header,
                bounds: window,
                // Keep header buttons, links, and form controls interactive on touch screens.
                ignore: "button, input, textarea, select, option, a, [role='button'], .window-controls",
                allowNativeTouchScrolling: false,
                onPress: () => focusWindow(windowKey),
            });

            return () => {
                draggable.forEach((d) => d.kill());
                if (ref.current) gsap.set(ref.current, { clearProps: "transform" });
            };
        }, [isOpen, isMinimized, isMaximized]);

        if (!isOpen || isMinimized) return null;

        return (
            <section
                id={windowKey}
                ref={ref}
                style={{ zIndex }}
                className={`window absolute ${isMaximized ? "maximized" : ""} ${isFocused ? "focused" : ""}`}
                onPointerDown={() => focusWindow(windowKey)}
            >
                <Component {...props} />
            </section>
        );
    };

    Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;
    return Wrapped;
};

export default WindowWrapper;

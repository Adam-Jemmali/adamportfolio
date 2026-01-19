import useWindowStore from "#store/window.js";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(Draggable);

const WindowWrapper = (Component, windowKey) => {
    const Wrapped = (props) => {
        const { focusWindow, windows } = useWindowStore();
        const ref = useRef(null);

        const windowState = windows[windowKey];
        const isOpen = windowState?.isOpen;
        const zIndex = windowState?.zIndex ?? 0;

        useGSAP(() => {
            if (!isOpen || !ref.current) return;

            gsap.fromTo(
                ref.current,
                { opacity: 0, scale: 0.95, y: 20 },
                {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.25,
                    ease: "power2.out",
                }
            );
        }, [isOpen]);

        // drag the header
        useGSAP(() => {
            if (!isOpen || !ref.current) return;

            const header = ref.current.querySelector("#window-header");
            if (!header) return;

            const draggable = Draggable.create(ref.current, {
                trigger: header,
                bounds: window,
                onPress: () => focusWindow(windowKey),
            });

            return () => {
                draggable.forEach(d => d.kill());
            };
        }, [isOpen]);

        if (!isOpen) return null;

        return (
            <section
                id={windowKey}
                ref={ref}
                style={{ zIndex }}
                className="absolute"
                onMouseDown={() => focusWindow(windowKey)}
            >
                <Component {...props} />
            </section>
        );
    };

    Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;
    return Wrapped;
};

export default WindowWrapper;

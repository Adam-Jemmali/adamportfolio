import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useSystemStore from "#store/system.js";
import Screensaver from "#components/Screensaver.jsx";

const SuspendScreen = () => {
    const wake = useSystemStore((s) => s.wake);
    const ref = useRef(null);
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
        const id = setInterval(() => setTime(dayjs()), 1000);
        return () => clearInterval(id);
    }, []);

    // Matches the on-screen hint: any mouse movement or key press wakes it,
    // not just a click.
    useEffect(() => {
        window.addEventListener("mousemove", wake);
        window.addEventListener("keydown", wake);
        return () => {
            window.removeEventListener("mousemove", wake);
            window.removeEventListener("keydown", wake);
        };
    }, [wake]);

    useGSAP(() => {
        gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.7 });
        gsap.fromTo(
            ".suspend-hint",
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, delay: 0.4, ease: "power3.out" }
        );
    }, []);

    return (
        <section ref={ref} className="suspend-screen" onClick={wake}>
            <Screensaver />

            <div className="suspend-clock-wrap">
                <p className="suspend-time">{time.format("h:mm")}</p>

                <div className="suspend-mirror" aria-hidden="true">
                    <div className="suspend-mirror-flip">
                        <p className="suspend-time">{time.format("h:mm")}</p>
                    </div>
                </div>

                <p className="suspend-date">{time.format("dddd, MMMM D")}</p>
            </div>

            <p className="suspend-hint">Move the mouse or press a key to wake…</p>
        </section>
    );
};

export default SuspendScreen;

import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Power } from "lucide-react";
import useSystemStore from "#store/system.js";

const SuspendScreen = () => {
    const wake = useSystemStore((s) => s.wake);
    const ref = useRef(null);
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
        const id = setInterval(() => setTime(dayjs()), 1000);
        return () => clearInterval(id);
    }, []);

    useGSAP(() => {
        gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.7 });
        gsap.fromTo(
            ".suspend-wake",
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, delay: 0.4, ease: "power3.out" }
        );
    }, []);

    return (
        <section ref={ref} className="suspend-screen" onClick={wake}>
            <div className="suspend-clock-wrap">
                <p className="suspend-time">{time.format("h:mm")}</p>

                <div className="suspend-mirror" aria-hidden="true">
                    <div className="suspend-mirror-flip">
                        <p className="suspend-time">{time.format("h:mm")}</p>
                    </div>
                </div>

                <p className="suspend-date">{time.format("dddd, MMMM D")}</p>
            </div>

            <div className="suspend-wake">
                <span className="suspend-icon">
                    <Power size={30} strokeWidth={1.75} />
                </span>
                <p className="neon-text">Click to wake</p>
            </div>
        </section>
    );
};

export default SuspendScreen;

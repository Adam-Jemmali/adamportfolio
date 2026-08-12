import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import useSystemStore from "#store/system.js";

const SuspendScreen = () => {
    const wake = useSystemStore((s) => s.wake);
    const ref = useRef(null);

    useGSAP(() => {
        gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.7 });
    }, []);

    return (
        <section ref={ref} className="suspend-screen" onClick={wake}>
            <p>Click to wake</p>
        </section>
    );
};

export default SuspendScreen;

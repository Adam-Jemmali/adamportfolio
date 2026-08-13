import React, { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useWindowStore from "#store/window.js";

const Text = () => {
    const data = useWindowStore((state) => state.windows.txtfile.data);
    const bodyRef = useRef(null);

    useGSAP(() => {
        if (!bodyRef.current) return;

        const ctx = gsap.context(() => {
            // Word-by-word subtitle reveal.
            gsap.fromTo(
                ".about-subtitle-word",
                { opacity: 0, y: 14, filter: "blur(6px)" },
                { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, stagger: 0.055, ease: "power3.out" }
            );

            // Paragraphs slide up in sequence.
            gsap.fromTo(
                ".about-para",
                { opacity: 0, y: 26 },
                { opacity: 1, y: 0, duration: 0.7, stagger: 0.16, ease: "power3.out", delay: 0.35 }
            );

            // Decorative underline grows in.
            gsap.fromTo(
                ".about-rule",
                { scaleX: 0 },
                { scaleX: 1, duration: 0.6, ease: "power2.out", delay: 0.3 }
            );
        }, bodyRef);

        return () => ctx.revert();
    }, [data?.name]);

    if (!data) return null;

    const { name, subtitle, image, description } = data;

    return (
        <>
            <div id="window-header">
                <WindowsControls target="txtfile" />
                <div className="flex-1 text-center">
                    <h1 className="text-xs font-medium text-zinc-300">{name}</h1>
                </div>
            </div>

            <div ref={bodyRef} className="text-content">
                {image && (
                    <div className="mb-4">
                        <img src={image} alt={name} className="w-full h-48 object-cover rounded-md" />
                    </div>
                )}

                {subtitle && (
                    <p className="about-subtitle">
                        {subtitle.split(" ").map((word, index) => (
                            <span key={index} className="about-subtitle-word">{word}&nbsp;</span>
                        ))}
                    </p>
                )}

                <span className="about-rule" />

                {description && Array.isArray(description) && (
                    <div className="space-y-4 mt-5">
                        {description.map((para, index) => (
                            <p key={index} className="about-para">
                                {para}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

const TextWindow = WindowWrapper(Text, "txtfile");
export default TextWindow;

import React, { useEffect, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useUIStore from "#store/ui.js";

const LoadingScreen = () => {
    const { isLoading } = useUIStore();
    const [progress, setProgress] = useState(0);

    useGSAP(() => {
        if (isLoading) {
            // Reset progress
            setProgress(0);
            
            // Animate progress bar
            const tl = gsap.timeline();

            tl.to({}, {
                duration: 2.5,
                onUpdate: function() {
                    setProgress(Math.round(this.progress() * 100));
                },
                ease: "power1.inOut",
            });

            // Logo entrance and pulse
            gsap.fromTo(".loading-logo", 
                { scale: 0.3, opacity: 0, rotate: -45 },
                { scale: 1, opacity: 1, rotate: 0, duration: 1.2, ease: "elastic.out(1, 0.75)" }
            );
            
            gsap.to(".loading-logo", {
                scale: 1.1,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Pulse the background glow
            gsap.to(".bg-glow", {
                scale: 1.5,
                opacity: 0.2,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center font-georama overflow-hidden">
            {/* Background glow */}
            <div className="bg-glow absolute w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />
            
            <div className="relative mb-12">
                <img src="/public/icons/AJ.svg" alt="AJ Logo" className="loading-logo w-32 h-32 z-10" />
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-50" />
            </div>
            
            <div className="relative w-72 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-white/20 rounded-full blur opacity-25" />
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                    <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 via-white to-blue-400 bg-[length:200%_100%] transition-all duration-75 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            
            <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <p className="text-white/40 text-[11px] tracking-[0.3em] font-medium uppercase">
                        System Initialize
                    </p>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
                </div>
                <p className="text-white font-mono text-xs opacity-80">
                    LOADING..{progress.toString().padStart(2, '0')}%
                </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-8 left-8 flex gap-4">
                <div className="w-12 h-[1px] bg-white/20" />
                <div className="w-[1px] h-12 bg-white/20" />
            </div>
            <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4">
                <div className="w-12 h-[1px] bg-white/20" />
                <div className="w-[1px] h-12 bg-white/20" />
            </div>
        </div>
    );
};

export default LoadingScreen;

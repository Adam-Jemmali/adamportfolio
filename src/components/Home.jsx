import React, {useRef, useState} from 'react'
import clsx from "clsx";
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { locations } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";

gsap.registerPlugin(Draggable);

const Home = () => {
    const { openWindow } = useWindowStore();
    const { setActiveLocation } = useLocationStore();
    const containerRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    useGSAP(() => {
        Draggable.create(".folder-item", {
            bounds: containerRef.current,
            inertia: true,
            onPress: function() {
                // This helps with selection when starting a drag
                const id = this.target.getAttribute('data-id');
                setSelectedId(Number(id));
            }
        });
    }, { scope: containerRef });

    const handleFolderClick = (e, item) => {
        e.stopPropagation();
        setSelectedId(item.id);
    };

    const handleFolderDoubleClick = (item) => {
        setActiveLocation(item);
        openWindow('finder');
    };

    const handleBackgroundClick = () => {
        setSelectedId(null);
    };

    return (
        <section
            id="home"
            ref={containerRef}
            className="absolute inset-0 pt-20 p-10 select-none pointer-events-none"
            onClick={handleBackgroundClick}
        >
            <div className="flex flex-col flex-wrap h-full gap-1 items-start content-start pointer-events-none">
                {locations.work?.children?.map((item) => (
                    <div
                        key={item.id}
                        data-id={item.id}
                        className={clsx(
                            "folder-item group flex flex-col items-center gap-1 w-28 p-2 cursor-pointer rounded-md transition-colors pointer-events-auto",
                            selectedId === item.id ? "bg-blue-500/30" : "hover:bg-white/10"
                        )}
                        onClick={(e) => handleFolderClick(e, item)}
                        onDoubleClick={() => handleFolderDoubleClick(item)}
                    >
                        <img
                            src={item.icon || "public/images/folder.png"}
                            alt={item.name}
                            className={clsx(
                                "w-16 h-16 object-contain pointer-events-none transition-opacity",
                                selectedId === item.id ? "opacity-100" : "group-active:opacity-80"
                            )}
                        />
                        <p className={clsx(
                            "text-white text-[13px] leading-tight text-center break-words line-clamp-2 text-shadow-md px-1 rounded-sm transition-colors select-none pointer-events-none max-w-full",
                            selectedId === item.id ? "bg-blue-600" : "group-hover:bg-blue-600/80"
                        )}>
                            {item.name}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}
export default Home

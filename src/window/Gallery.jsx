import React, { useState } from 'react';
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { GALLERY_DATA } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import clsx from "clsx";

const Gallery = () => {
    const { openWindow, focusWindow } = useWindowStore();
    const [activeCategory, setActiveCategory] = useState(GALLERY_DATA[0]);

    const handleImageClick = (image) => {
        openWindow('imgfile', image);
        focusWindow('imgfile');
    };

    return (
        <div className="flex flex-col h-full">
            <div id="window-header">
                <WindowsControls target="photos" />
                <span className="flex-1 text-center font-bold text-gray-700">Photos</span>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <aside className="sidebar">
                    <h2>Library</h2>
                    <ul>
                        {GALLERY_DATA.map((category) => (
                            <li 
                                key={category.id} 
                                onClick={() => setActiveCategory(category)}
                                className={clsx(
                                    activeCategory.id === category.id && "bg-white !text-black"
                                )}
                            >
                                <img src={category.icon} alt={category.name} />
                                <p>{category.name}</p>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="gallery flex-1 overflow-y-auto">
                    <ul className="grid grid-cols-5 gap-2.5">
                        {activeCategory.images.map((image) => (
                            <li 
                                key={image.id} 
                                onClick={() => handleImageClick(image)}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <img src={image.imageUrl} alt={image.name} className="w-full h-full object-cover rounded-lg" />
                            </li>
                        ))}
                    </ul>
                </main>
            </div>
        </div>
    );
};

const galleryWindow = WindowWrapper(Gallery, "photos");

export default galleryWindow;

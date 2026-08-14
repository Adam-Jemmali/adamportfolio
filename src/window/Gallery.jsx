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
                <span className="flex-1 text-center font-bold text-zinc-200">Photos</span>
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
                                    activeCategory.id === category.id && "bg-white/10 !text-white"
                                )}
                            >
                                <img src={category.icon} alt={category.name} />
                                <p>{category.name}</p>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="gallery flex-1 overflow-y-auto">
                    <ul className="listing-grid">
                        {activeCategory.images.map((image) => (
                            <li key={image.id}>
                                <button
                                    type="button"
                                    className="listing-tile"
                                    onClick={() => handleImageClick(image)}
                                    aria-label={`Open ${image.name}`}
                                >
                                    <span className="listing-tile-inner">
                                        <img src={image.imageUrl} alt={image.name} loading="lazy" />
                                        <span className="listing-tile-overlay" aria-hidden="true">
                                            <span className="listing-tile-title">{image.name}</span>
                                            <span className="listing-tile-sub">{activeCategory.name} · 2026</span>
                                        </span>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </main>
            </div>
        </div>
    );
};

const GalleryWindow = WindowWrapper(Gallery, "photos");

export default GalleryWindow;

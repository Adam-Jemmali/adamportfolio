import React, { useState } from 'react'
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import {Search, Folder} from "lucide-react"
import {locations} from "#constants/index.js";
import useLocationStore from "#store/location.js";
import clsx from "clsx";
import useWindowStore from "#store/window.js";

const resolveIcon = (icon) => (icon && icon.startsWith('public') ? `/${icon}` : icon);

const Finder = () => {
    const {openWindow, focusWindow}= useWindowStore()
    const activeLocation = useLocationStore((state) => state.activeLocation)
    const setActiveLocation = useLocationStore((state) => state.setActiveLocation)
    const [query, setQuery] = useState("");

    const visibleItems = (activeLocation?.children ?? []).filter((item) =>
        item.name.toLowerCase().includes(query.trim().toLowerCase())
    );

    const openItem = (item) =>{
        if( item.fileType ==="pdf") {
            openWindow('resume', item);
            focusWindow('resume');
            return;
        }
        if( item.fileType ==="txt") {
            openWindow('txtfile', item);
            focusWindow('txtfile');
            return;
        }
        if( item.fileType ==="img") {
            openWindow('imgfile', item);
            focusWindow('imgfile');
            return;
        }
        if( item.kind ==="folder") return setActiveLocation(item)
        if(['fig','url'].includes(item.fileType ) && item.href) return window.open(item.href, '_blank')
    }

    const isActive = (item) => item?.id === activeLocation?.id;

    return (
        <>
            <div id="window-header" >
                <WindowsControls target="finder"/>
                <h2>Portfolio</h2>
                <div className="finder-search">
                    <Search size={13} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search this folder…"
                        aria-label="Search this folder"
                    />
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                <div className="sidebar">
                    <div>
                        <h3>Locations</h3>
                        <ul>
                            {Object.values(locations).map((item) => (
                                <li key={item.id}
                                    onClick={() => setActiveLocation(item)}
                                    className={clsx("cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md transition-colors", isActive(item) ? "active" : "hover:bg-white/5")}
                                >
                                    <img src={resolveIcon(item.icon)} className="w-4" alt={item.name} />
                                    <p className="text-sm font-medium">{item.name}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3>Projects</h3>
                        <ul>
                            {locations.work?.children?.map((item) => (
                                <li key={item.id}
                                    onClick={() => setActiveLocation(item)}
                                    className={clsx("cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md transition-colors", isActive(item) ? "active" : "hover:bg-white/5")}
                                >
                                    <Folder strokeWidth={1.6} className="w-4 text-sky-400 shrink-0" />
                                    <p className="text-sm font-medium">{item.name}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <ul className="content">
                    {visibleItems.length === 0 && (
                        <li className="finder-empty">
                            {query.trim() ? `No matches for "${query.trim()}"` : "This folder is empty"}
                        </li>
                    )}
                    {visibleItems.map((item) => (
                        <li key={item.id} className={item.position} onClick={() => openItem(item)} title={item.name}>
                            {item.kind === "folder" ? (
                                <Folder strokeWidth={1.4} className="finder-folder-icon" />
                            ) : (
                                <img src={resolveIcon(item.icon)} alt={item.name} />
                            )}
                            <p className="text-shadow-md">{item.name}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};
const FinderWindow = WindowWrapper(Finder, "finder");

export default FinderWindow;

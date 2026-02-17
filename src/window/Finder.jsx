import React from 'react'
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import {Search} from "lucide-react"
import {locations} from "#constants/index.js";
import useLocationStore from "#store/location.js";
import clsx from "clsx";
import useWindowStore from "#store/window.js";

const Finder = () => {
    const {openWindow, focusWindow}= useWindowStore()
    const activeLocation = useLocationStore((state) => state.activeLocation)
    const setActiveLocation = useLocationStore((state) => state.setActiveLocation)

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
    return (
        <>
            <div id="window-header" >
                <WindowsControls target="finder"/>


            </div>

            <div className="bg-white flex flex-1 min-h-0">
                <div className="sidebar">

                    <div>
                        <h3>Locations</h3>
                        <ul>
                            {Object.values(locations).map((item) => (
                                <li key={item.id}  onClick={() => setActiveLocation(item)}
                                    className={clsx("cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md transition-colors", item.id === activeLocation?.id ? "bg-blue-100 text-blue-700": "text-gray-700 hover:bg-gray-200")}

                                >
                                    <img src={item.icon.startsWith('public') ? `/${item.icon}` : item.icon} className="w-4" alt={item.name} />
                                    <p className="text-sm font-medium">{item.name}</p>
                                </li>

                            ))}
                        </ul>
                    </div>

                    <div>

                        <h3>Projects</h3>
                        <ul>
                            {locations.work?.children?.map((item) => (
                                <li key={item.id}  onClick={() => setActiveLocation(item)}
                                    className={clsx("cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md transition-colors", item.id === activeLocation?.id ? "bg-blue-100 text-blue-700": "text-gray-700 hover:bg-gray-200")}

                                >
                                    <img src={item.icon.startsWith('public') ? `/${item.icon}` : item.icon} className="w-4" alt={item.name} />
                                    <p className="text-sm font-medium">{item.name}</p>
                                </li>

                            ))}
                        </ul>
                    </div>

                </div>

                <ul className="content">
                    {activeLocation?.children?.map((item) => (
                        <li key={item.id} className={item.position} onClick={() => openItem(item)}>
                            <img src={item.icon.startsWith('public') ? `/${item.icon}` : item.icon} alt={item.name} />
                            <p className="text-shadow-md text-black">{item.name}</p>
                        </li>
                    ))}
                </ul>

            </div>

        </>
    );
};
const finderWindow= WindowWrapper(Finder,"finder");

export default finderWindow;
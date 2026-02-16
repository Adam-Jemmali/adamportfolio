import React from 'react'
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import {Search} from "lucide-react"
import {locations} from "#constants/index.js";
import useLocationStore from "#store/location.js";
import clsx from "clsx";
import useWindowStore from "#store/window.js";

const Finder = () => {
    const {openWindow}= useWindowStore()
    const activeLocation = useLocationStore((state) => state.activeLocation)
    const setActiveLocation = useLocationStore((state) => state.setActiveLocation)

    const openItem = (item) =>{
        if( item.fileType ==="pdf") return openWindow('resume')
        if( item.fileType ==="txt") return openWindow('txtfile', item)
        if( item.fileType ==="img") return openWindow('imgfile', item)
        if( item.kind ==="folder") return setActiveLocation(item)
        if(['fig','url'].includes(item.fileType ) && item.href) return window.open(item.href, '_blank')
    }
    return (
        <>
            <div id="window-header" >
                <WindowsControls target="finder"/>


            </div>

            <div className="bg-white flex h-full">
                <div className="sidebar">

                    <div>
                        <h3>YOOO</h3>
                        <ul>
                            {Object.values(locations).map((item) => (
                                <li key={item.id}  onClick={() => setActiveLocation(item)}
                                    className={clsx("cursor-pointer", item.id === activeLocation?.id ? "active": "not-active")}

                                >
                                    <img src={item.icon} className="w-4" alt={item.name} />
                                    <p className="text-shadow-md text-black">{item.name}</p>
                                </li>

                            ))}
                        </ul>
                    </div>

                    <div>

                        <h3>lool</h3>
                        <ul>
                            {locations.work?.children?.map((item) => (
                                <li key={item.id}  onClick={() => setActiveLocation(item)}
                                    className={clsx("cursor-pointer", item.id === activeLocation?.id ? "active": "not-active")}

                                >
                                    <img src={item.icon} className="w-4" alt={item.name} />
                                    <p className="text-shadow-md text-black">{item.name}</p>
                                </li>

                            ))}
                        </ul>
                    </div>

                </div>

                <ul className="content">
                    {activeLocation?.children?.map((item) => (
                        <li key={item.id} className={item.position} onClick={() => openItem(item)}>
                            <img src={item.icon} alt={item.name} />
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
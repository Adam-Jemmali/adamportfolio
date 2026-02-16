import {dockApps, navIcons, navLinks} from "#constants/index.js";
import dayjs from "dayjs";
import {useRef} from "react";
import {Tooltip} from "react-tooltip";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";


const Navbar = () => {



    const bariconsRef = useRef(null);
    const{openWindow,closeWindow,windows}=useWindowStore();
    const { resetActivateLocation } = useLocationStore();

    const handleLogoClick = () => {
        // Close all open windows
        Object.keys(windows).forEach((windowKey) => {
            if (windows[windowKey].isOpen) {
                closeWindow(windowKey);
            }
        });
        // Reset location to default
        resetActivateLocation();
    };


    useGSAP(() => {
        const dock = bariconsRef.current;
        if (!dock) return;

        //get query of all icons

        const icons = dock.querySelectorAll(".dock-icon");

        const animateIcons = (mouseX) => {
            const {left} = dock.getBoundingClientRect();

            icons.forEach((icon) => {
                const {left: iconleft, width} = icon.getBoundingClientRect();
                const center = iconleft - left + width / 2;
                const distance = Math.abs(mouseX - center);
                const intensity = Math.exp(-(distance ** 2) / 20000);

                gsap.to(icon, {
                    scale: 1 +0.5* intensity,
                    y: -15 * intensity,
                    duration: 0.2,
                    ease: "power1.out",
                });
            });
        };

        const handlemousemove = (e) => {
            const {left} = dock.getBoundingClientRect();
            animateIcons(e.clientX - left);
        };

        const resetIcons = () => {
            icons.forEach((icon) => {
                gsap.killTweensOf(icon);
                gsap.to(icon, {
                    scale: 1,
                    duration: 0.1,
                    ease: "power1.out",
                    y: 0,
                });
            });
        };

        dock.addEventListener("mousemove", handlemousemove);
        dock.addEventListener("mouseleave", resetIcons);

        // Cleanup function
        return () => {
            dock.removeEventListener("mousemove", handlemousemove);
            dock.removeEventListener("mouseleave", resetIcons);
        };
    }, []);

    const toggleApp = (app) => {
        if(!app.canOpen) return ;
        const window= windows[app.id];
        if(window.isOpen) {
            closeWindow(app.id);

        }else {
            openWindow(app.id);
        }
        console.log(windows);
    };

    return (
        <nav>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleLogoClick}
                    className="logo p-0 cursor-pointer flex items-center justify-center transition-all"
                >
                    <img src="public/icons/AJ.svg" alt="AJ Logo" className="w-10 h-10" />
                </button>
                <ul>
                    {navLinks.map(({id, name,type}) => (
                        <li key={id} onClick={() => openWindow(type)}>
                            <p>{name}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div ref={bariconsRef} id="dock" className="dock-container">
                {dockApps.map(({id, name, icon, canOpen}) => (
                    <div key={id} className="relative flex justify-center">
                        <button
                            type="button"
                            className="dock-icon"
                            aria-label={name}
                            data-tooltip-id="dock-tooltip"
                            data-tooltip-delay-show={150}
                            data-tooltip-content={name}
                            disabled={!canOpen}
                            onClick={() => toggleApp({id, canOpen})}
                        >
                            <img
                                src={icon}
                                alt={name}
                                loading="lazy"
                                className={canOpen ? "" : "opacity-50"}
                            />
                        </button>
                    </div>
                ))}
                <Tooltip id="dock-tooltip" place="top" className="tooltip"/>
            </div>

            <div>
                <ul>
                    {navIcons.map(({id, img}) => (
                        <li key={id}>
                            <img src={img} className="icon-hover" alt={`icon-${id}`} />
                        </li>
                    ))}
                </ul>
                <time className="text-black">{dayjs().format("YYYY-MM-DD h:mm A")}</time>
            </div>
        </nav>
    );
};

export default Navbar;
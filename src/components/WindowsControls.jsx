import React from 'react'
import useWindowStore from "#store/window.js";

const WindowsControls = ({target}) => {
    const {closeWindow}=useWindowStore();
    const {openWindow}= useWindowStore();



    return (
        <div id="window-controls">
            <div className="close" onClick={() => closeWindow(target)}/>
            <div className="maximize" onClick={() => openWindow(target)}/>
            <div className="minimize" onClick={() => closeWindow(target)}/>


            </div>


    )
}
export default WindowsControls

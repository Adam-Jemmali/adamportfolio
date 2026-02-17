import React from 'react'
import useWindowStore from "#store/window.js";

const WindowsControls = ({target}) => {
    const {closeWindow}=useWindowStore();
    const {openWindow}= useWindowStore();



    const {focusWindow}= useWindowStore();



    return (
        <div id="window-controls">
            <div className="close" onClick={() => closeWindow(target)}/>
            <div className="maximize" onClick={() => focusWindow(target)}/>
            <div className="minimize" onClick={() => closeWindow(target)}/>


            </div>


    )
}
export default WindowsControls

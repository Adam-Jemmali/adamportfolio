import React from 'react'
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import {socials} from "#constants/index.js";

const Contact = () => {
    return (
        <>
            <div id="window-header">
                <h2> Contact me</h2>
                <WindowsControls target="contact"/>

            </div>
            <div className="items-center p-5">

                <img src="public/images/adrian.jpg" alt="Adam" className="rounded-b-full"/>
                <h3> Lets Connect</h3>
                <p> Happy to connect! Got an idea? Or just wanna talk  tech? I'm all in!</p>
                <ul>
                    {socials.map(( {id,text,icon,bg,link}) => (

                        <li key={id} style={{backgroundColor:bg}}>
                            <a href={link}  title={text}>

                                <img src={icon} alt={text}/>
                                <p className="text-shadow-md">{text}</p>
                            </a>


                        </li>
                        )) }
                </ul>
            </div>

        </>
    )
}
const ContactWindow= WindowWrapper(Contact,'contact')
export default ContactWindow

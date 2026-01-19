import React from 'react'
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import {techStack} from "#constants/index.js";
import {Car, Check, LucideMousePointer} from "lucide-react";
import WindowsControls from "#components/WindowsControls.jsx";

const Terminal = () => {
    return <>
        <div id="window-header" >
            <WindowsControls target="terminal"/>
            <h2 > Tech Stack </h2>
        </div>

        <div className="techstack">
            <p  > <span className="font-bold text-gray-300">PC C:\Users\adamj
            </span> npm show tech stack</p>

        <div className="label" >
            <p className="w-32 text-white" > Category</p>
            <p className="w-32 text-white"> Technologies</p>


        </div>

            <ul className="content1">
                {techStack.map(({category,items}) => (
                    <li className="flex items-center">
                        <Check className="check"/>
                            <h3> {category}</h3>

                        <ul>
                            {items.map((item,i)=> (
                                <li key={i}> {item}</li>
                            ))}
                        </ul>



                    </li>

                ))}

            </ul>

            <div  className="footnote">
                <p>
                     <Car/>  full stack  was loaded successfully (100%) <Check/>
                </p>


            </div>

        </div>


    </>

}
//HOC
const TerminalWindow= WindowWrapper(Terminal,"terminal");
export default TerminalWindow

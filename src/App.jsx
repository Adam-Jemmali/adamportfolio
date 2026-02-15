import React from 'react'
import Navbar from "#components/Navbar.jsx";
import Welcome from "#components/Welcome.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import gsap from "gsap";
import {Draggable} from "gsap/Draggable";
import {Terminal} from "#window/index.js";
import Safari from "#window/Safari.jsx";
import Resume from "#window/resume.jsx";
import Finder from "#window/Finder.jsx";
gsap.registerPlugin(Draggable);

const App = () => {
    return (
       <main>
           <Navbar />
           <Welcome />
           <Terminal />
           <Safari />
           <Resume/>
           <Finder/>




          </main>
    )
}
export default App


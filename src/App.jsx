import React from 'react'
import Navbar from "#components/Navbar.jsx";
import Welcome from "#components/Welcome.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import gsap from "gsap";
import {Draggable} from "gsap/Draggable";
import { Terminal, Finder, Text, Image, Safari, Resume, Contact } from "#window/index.js";
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
           <Text />
           <Image />
           <Contact/>




          </main>
    )
}
export default App


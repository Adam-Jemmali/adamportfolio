<<<<<<< HEAD
import React from "react";
=======
import React, { useEffect } from 'react'
>>>>>>> ba5b85c (final touches bef deploy)
import Navbar from "#components/Navbar.jsx";
import Welcome from "#components/Welcome.jsx";
import Home from "#components/Home.jsx";
import gsap from "gsap";
<<<<<<< HEAD
import { Draggable } from "gsap/Draggable";

import {
  Terminal,
  Finder,
  Text,
  Image,
  Safari,
  Resume,
  Contact,
  Gallery,
} from "#window/index.js";
=======
import {Draggable} from "gsap/Draggable";
import { Terminal, Finder, Text, Image, Safari, Resume, Contact, Gallery } from "#window/index.js";
import LoadingScreen from "#components/LoadingScreen.jsx";
import useUIStore from "#store/ui.js";
>>>>>>> ba5b85c (final touches bef deploy)

gsap.registerPlugin(Draggable);

const App = () => {
<<<<<<< HEAD
  return (
    <main>
      <Navbar />
      <Welcome />
      <Home />
=======
    const { setIsLoading } = useUIStore();

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
       <main>
           <LoadingScreen />
           <Navbar />
           <Welcome />
           <Home />
           <Terminal />
           <Safari />
           <Resume/>
           <Finder/>
           <Text />
           <Image />
           <Contact/>
           <Gallery />
>>>>>>> ba5b85c (final touches bef deploy)

      <Terminal />
      <Safari />
      <Resume />
      <Finder />
      <Text />
      <Image />
      <Contact />
      <Gallery />
    </main>
  );
};

export default App;

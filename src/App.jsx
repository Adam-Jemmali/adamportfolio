import React from "react";
import Navbar from "#components/Navbar.jsx";
import Welcome from "#components/Welcome.jsx";
import Home from "#components/Home.jsx";
import gsap from "gsap";
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

gsap.registerPlugin(Draggable);

const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Home />

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

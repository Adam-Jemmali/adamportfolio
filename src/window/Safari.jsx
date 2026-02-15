import React from 'react'
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import WindowsControls from "#components/WindowsControls.jsx";
import {ShieldHalf, PanelLeft, ChevronLeft, ChevronRight, Search, ArrowBigRight} from "lucide-react";
import {blogPosts} from "#constants/index.js";

const Safari = () => {
    return <>
        <div id="window-header">
            <WindowsControls target="safari"/>



            <div className="flex items-center">

            </div>

            <div className="flex-1 flex-center gap-1 ml-5">
                {/* This is where your URL/search bar content goes */}
            </div>



            <div className="search">
                <Search className="icon"/>
                <input
                    type="text"
                    placeholder="Search or enter website name"
                    className="flex-1 outline-none bg-transparent"
                />
            </div>
        </div>

        {/* Add your Safari content here (blog, etc.) */}
        <div className="blog">
            <h2>My blog</h2>
            <div className="space-y-8">
                {blogPosts.map(({id,image,title,date,link}) => (
                    <div key={id} className="blog-post">
                        <div className= "col-span-2">
                            <img src={image}  />
                        </div>
                        <div className= "content">
                            <p>{date}</p>
                            <p>{title}</p>
                            <a href={link} target="_blank" rel="noopener">
                                Check it out ! <ArrowBigRight/>
                            </a>
                        </div>



                    </div>

                    ))}
            </div>
        </div>
    </>
}

// HOC
const SafariWindow = WindowWrapper(Safari, "safari");
export default SafariWindow;
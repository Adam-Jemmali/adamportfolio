import React, { useState } from 'react'
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import WindowsControls from "#components/WindowsControls.jsx";
import {Search, ArrowBigRight} from "lucide-react";
import {blogPosts} from "#constants/index.js";

const Safari = () => {
    const [query, setQuery] = useState("");

    const visiblePosts = blogPosts.filter(({ title, date }) =>
        `${title} ${date}`.toLowerCase().includes(query.trim().toLowerCase())
    );

    return <>
        <div id="window-header">
            <WindowsControls target="safari"/>

            <div className="search">
                <Search className=""/>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search my blog…"
                    aria-label="Search my blog"
                    className="flex-1 outline-none bg-transparent"
                />
            </div>
        </div>

        <div className="blog">
            <h2>My blog</h2>
            {visiblePosts.length === 0 ? (
                <p className="text-zinc-500 text-sm">No posts match "{query}". Maybe try "AI" or "hackathon"?</p>
            ) : (
                <div className="space-y-8">
                    {visiblePosts.map(({id,image,title,date,link}) => (
                        <div key={id} className="blog-post">
                            <div className= "col-span-2">
                                <img src={image} alt={title} />
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
            )}
        </div>
    </>
}

// HOC
const SafariWindow = WindowWrapper(Safari, "safari");
export default SafariWindow;

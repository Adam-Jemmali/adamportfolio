import React, { useState } from 'react'
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import WindowsControls from "#components/WindowsControls.jsx";
import { Search, ArrowBigRight, ArrowRight, Check } from "lucide-react";
import { blogPosts } from "#constants/index.js";

const NEWSLETTER_ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT;

const Safari = () => {
    const [query, setQuery] = useState("");
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const visiblePosts = blogPosts.filter(({ title, date }) =>
        `${title} ${date}`.toLowerCase().includes(query.trim().toLowerCase())
    );

    const subscribe = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setError("Enter a valid email to join the clan.");
            return;
        }
        setError("");

        if (!NEWSLETTER_ENDPOINT) {
            setError("Signups aren't wired up yet. Add VITE_NEWSLETTER_ENDPOINT to your .env.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(NEWSLETTER_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email: cleanEmail }),
            });
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            setSubscribed(true);
        } catch {
            setError("Something went wrong. Email me directly instead.");
        } finally {
            setSubmitting(false);
        }
    };

    return <>
        <div id="window-header">
            <WindowsControls target="safari"/>

            <div className="search">
                <Search className=""/>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search top videos…"
                    aria-label="Search top videos"
                    className="flex-1 outline-none bg-transparent"
                />
            </div>
        </div>

        <div className="blog">
            <div className="newsletter">
                {!subscribed ? (
                    <>
                        <h3>Join the Forge. ⚒️</h3>
                        <p className="newsletter-sub">
                            One email when I ship something worth your time. Builders only. No spam, ever.
                        </p>
                        <form className="newsletter-form" onSubmit={subscribe}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@email.com"
                                aria-label="Email address"
                            />
                            <button type="submit" disabled={submitting}>
                                {submitting ? "Joining…" : "Join the clan"}
                                <ArrowRight size={15} />
                            </button>
                        </form>
                        {error && <p className="newsletter-error">{error}</p>}
                    </>
                ) : (
                    <div className="newsletter-success">
                        <span className="newsletter-check"><Check size={18} /></span>
                        <h3>Welcome to the Forge ⚒️</h3>
                        <p className="newsletter-sub">
                            You're in! We'll keep you posted at <b>{email}</b>.
                        </p>
                    </div>
                )}
            </div>

            <h2>Top videos</h2>
            {visiblePosts.length === 0 ? (
                <p className="text-zinc-500 text-sm">No videos match "{query}". Maybe try "AI" or "hackathon"?</p>
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

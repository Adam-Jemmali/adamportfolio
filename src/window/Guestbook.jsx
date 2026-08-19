import { useEffect, useState } from "react";
import WindowsControls from "#components/WindowsControls.jsx";
import { Snail } from "#components/AppMascots.jsx";
import { QuillIcon } from "#components/GuestbookIcons.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { readEntries, addEntry, readVisitorCount, bumpVisitorCount } from "#game/guestbook.js";
import { playClick } from "#utils/sound.js";
import useSystemStore from "#store/system.js";

const NAME_COLORS = ["#67e8f9", "#f472b6", "#a78bfa", "#fbbf24", "#4ade80", "#fb923c"];
const colorFor = (name) => NAME_COLORS[[...name].reduce((h, c) => h + c.charCodeAt(0), 0) % NAME_COLORS.length];

const formatDate = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const Guestbook = () => {
    const crash = useSystemStore((s) => s.crash);
    const [entries, setEntries] = useState(readEntries);
    // Bumped once per browser per calendar week (no backend, no invented
    // starting number), then re-read fresh every time someone actually signs.
    const [visitors, setVisitors] = useState(() => bumpVisitorCount());
    const [justSigned, setJustSigned] = useState(false);
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!justSigned) return;
        const id = setTimeout(() => setJustSigned(false), 700);
        return () => clearTimeout(id);
    }, [justSigned]);

    const submit = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setEntries(addEntry(name, message));
        setVisitors(readVisitorCount());
        setName("");
        setMessage("");
        setJustSigned(true);
        playClick();
    };

    const digits = String(visitors).padStart(6, "0").split("");

    return (
        <>
            <div id="window-header">
                <WindowsControls target="guestbook" />
                <h2><Snail />Guestbook</h2>
            </div>

            <div className="guestbook-body">
                <button
                    type="button"
                    className="guestbook-counter"
                    onClick={crash}
                    title="visitor counter"
                    aria-label="Visitor counter"
                >
                    <span className="guestbook-counter-label">you are visitor</span>
                    <span className="guestbook-counter-digits">
                        {digits.map((d, i) => (
                            <span key={i} className="guestbook-digit">{d}</span>
                        ))}
                    </span>
                </button>

                <form className={`guestbook-form ${justSigned ? "is-signed" : ""}`} onSubmit={submit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your handle…"
                        maxLength={40}
                        aria-label="Your handle"
                    />
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Leave a message…"
                        maxLength={240}
                        rows={2}
                        aria-label="Your message"
                    />
                    <button type="submit" className="guestbook-sign" disabled={!message.trim()}>
                        <QuillIcon /> {justSigned ? "Signed!" : "Sign it"}
                    </button>
                </form>

                {entries.length > 0 ? (
                    <ul className="guestbook-entries">
                        {entries.map((entry) => (
                            <li key={entry.id} className="guestbook-entry">
                                <div className="guestbook-entry-head">
                                    <span className="guestbook-entry-name" style={{ color: colorFor(entry.name) }}>
                                        {entry.name}
                                    </span>
                                    <span className="guestbook-entry-date">{formatDate(entry.date)}</span>
                                </div>
                                <p className="guestbook-entry-msg">{entry.message}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="guestbook-empty">No one's signed yet, be the first!</p>
                )}
            </div>
        </>
    );
};

const GuestbookWindow = WindowWrapper(Guestbook, "guestbook");
export default GuestbookWindow;

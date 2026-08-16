import { useState } from "react";
import { Check, Link2, Plus, Trash2 } from "lucide-react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useSystemStore from "#store/system.js";
import { wallpapers } from "#constants/index.js";

const deriveName = (url) => {
    try {
        const u = new URL(url);
        const base = decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || "");
        return base && base.includes(".") ? base : u.hostname;
    } catch {
        return "Custom wallpaper";
    }
};

const wallpaperBackground = (wp) =>
    wp.type === "gradient" ? wp.value : `url("${wp.value}")`;

const Backgrounds = () => {
    const wallpaper = useSystemStore((s) => s.wallpaper);
    const setWallpaper = useSystemStore((s) => s.setWallpaper);
    const customWallpapers = useSystemStore((s) => s.customWallpapers);
    const addWallpaper = useSystemStore((s) => s.addWallpaper);
    const removeWallpaper = useSystemStore((s) => s.removeWallpaper);

    const [url, setUrl] = useState("");
    const [error, setError] = useState("");

    const all = [...wallpapers, ...customWallpapers.map((wp) => ({ ...wp, custom: true }))];

    const submit = (e) => {
        e.preventDefault();
        const clean = url.trim();
        if (!clean) return;

        try {
            const parsed = new URL(clean);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                setError("Paste an http(s) image URL.");
                return;
            }
        } catch {
            setError("That doesn't look like a valid URL.");
            return;
        }

        addWallpaper({
            id: `custom-${Date.now()}`,
            name: deriveName(clean),
            type: "image",
            value: clean,
        });
        setUrl("");
        setError("");
    };

    return (
        <>
            <div id="window-header">
                <WindowsControls target="backgrounds" />
                <h2>Backgrounds</h2>
            </div>

            <div className="backgrounds-body">
                <p className="backgrounds-hint">
                    Pick a wallpaper, or paste an image URL to add your own.
                </p>

                <form className="backgrounds-add" onSubmit={submit}>
                    <Link2 size={15} className="shrink-0" />
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste an image URL…"
                        aria-label="Custom wallpaper URL"
                    />
                    <button type="submit"><Plus size={15} /> Add</button>
                </form>
                {error && <p className="backgrounds-error">{error}</p>}

                <div className="backgrounds-grid">
                    {all.map((wp) => (
                        <div
                            key={wp.id}
                            className={`backgrounds-card ${wallpaper === wp.id ? "active" : ""}`}
                        >
                            <button
                                type="button"
                                className="backgrounds-card-main"
                                onClick={() => setWallpaper(wp.id)}
                            >
                                <span
                                    className="backgrounds-swatch"
                                    style={{
                                        backgroundImage: wallpaperBackground(wp),
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                />
                                <span className="backgrounds-name">{wp.name}</span>
                                {wallpaper === wp.id && <Check size={14} className="backgrounds-check" />}
                            </button>
                            {wp.custom && (
                                <button
                                    type="button"
                                    className="backgrounds-remove"
                                    onClick={() => removeWallpaper(wp.id)}
                                    aria-label={`Remove ${wp.name}`}
                                    title="Remove"
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

const BackgroundsWindow = WindowWrapper(Backgrounds, "backgrounds");
export default BackgroundsWindow;

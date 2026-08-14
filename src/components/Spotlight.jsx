import { createElement, useEffect, useMemo, useState } from "react";
import { Search, Folder, CornerDownLeft } from "lucide-react";
import { desktopApps, locations } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import useLocationStore from "#store/location.js";

// Central command palette — press Cmd/Ctrl+K anywhere on the desktop.
const Spotlight = () => {
    const { openWindow, focusWindow } = useWindowStore();
    const setActiveLocation = useLocationStore((s) => s.setActiveLocation);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);

    const items = useMemo(() => {
        const list = [];

        desktopApps.forEach((app) => {
            list.push({
                id: `app-${app.id}`,
                label: app.name,
                hint: "Application",
                icon: app.icon,
                iconStyle: { background: app.tile },
                keywords: `${app.name} app application ${app.id}`,
                run: () => {
                    openWindow(app.appId);
                    focusWindow(app.appId);
                },
            });
        });

        Object.values(locations).forEach((loc) => {
            list.push({
                id: `loc-${loc.id}`,
                label: loc.name,
                hint: "Folder",
                icon: Folder,
                iconStyle: { background: "linear-gradient(135deg, #38bdf8, #0369a1)" },
                keywords: `${loc.name} folder location`,
                run: () => {
                    setActiveLocation(loc);
                    openWindow("finder");
                    focusWindow("finder");
                },
            });
        });

        (locations.work?.children ?? []).forEach((proj) => {
            list.push({
                id: `proj-${proj.id}`,
                label: proj.name,
                hint: "Project",
                icon: Folder,
                iconStyle: { background: "linear-gradient(135deg, #7dd3fc, #2563eb)" },
                keywords: `${proj.name} project folder`,
                run: () => {
                    setActiveLocation(proj);
                    openWindow("finder");
                    focusWindow("finder");
                },
            });

            (proj.children ?? []).forEach((file) => {
                list.push({
                    id: `file-${proj.id}-${file.id}`,
                    label: file.name,
                    hint: proj.name,
                    icon: Folder,
                    iconStyle: { background: "linear-gradient(135deg, #94a3b8, #475569)" },
                    keywords: `${file.name} ${proj.name} file`,
                    run: () => {
                        if (file.fileType === "txt") {
                            openWindow("txtfile", file);
                            focusWindow("txtfile");
                        } else if (file.fileType === "img") {
                            openWindow("imgfile", file);
                            focusWindow("imgfile");
                        } else if (file.fileType === "pdf") {
                            openWindow("resume", file);
                            focusWindow("resume");
                        } else if (file.href) {
                            window.open(file.href, "_blank");
                        } else {
                            setActiveLocation(proj);
                            openWindow("finder");
                            focusWindow("finder");
                        }
                    },
                });
            });
        });

        return list;
    }, [openWindow, focusWindow, setActiveLocation]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((item) => item.keywords.includes(q) || item.label.toLowerCase().includes(q));
    }, [items, query]);

    useEffect(() => {
        const openFromButton = () => {
            setQuery("");
            setActiveIndex(0);
            setOpen(true);
        };
        const onKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                if (open) {
                    setOpen(false);
                } else {
                    setQuery("");
                    setActiveIndex(0);
                    setOpen(true);
                }
            } else if (e.key === "Escape" && open) {
                setOpen(false);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("spotlight:open", openFromButton);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("spotlight:open", openFromButton);
        };
    }, [open]);

    const close = () => setOpen(false);

    const runItem = (item) => {
        item.run();
        close();
    };

    const onListKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[activeIndex]) runItem(filtered[activeIndex]);
        }
    };

    if (!open) return null;

    return (
        <div className="spotlight-overlay" onPointerDown={close}>
            <div
                className="spotlight-panel"
                onPointerDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-label="Spotlight search"
            >
                <div className="spotlight-input-row">
                    <Search size={18} />
                    <input
                        type="text"
                        value={query}
                        autoFocus
                        placeholder="Search apps, projects and files…"
                        aria-label="Spotlight search"
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={onListKeyDown}
                    />
                    <kbd>⌘K</kbd>
                </div>

                <ul className="spotlight-results">
                    {filtered.length === 0 && (
                        <li className="spotlight-empty">No results for “{query.trim()}”</li>
                    )}
                    {filtered.map((item, i) => (
                        <li
                            key={item.id}
                            className={`spotlight-result ${i === activeIndex ? "active" : ""}`}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => runItem(item)}
                        >
                            <span className="spotlight-icon" style={item.iconStyle}>
                                {createElement(item.icon, { strokeWidth: 1.7 })}
                            </span>
                            <span className="spotlight-text">
                                <span className="spotlight-label">{item.label}</span>
                                <span className="spotlight-hint">{item.hint}</span>
                            </span>
                            {i === activeIndex && <CornerDownLeft size={14} className="spotlight-enter" />}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Spotlight;

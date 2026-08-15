import React, { useEffect, useMemo, useRef, useState } from "react";
import WindowsControls from "#components/WindowsControls.jsx";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { Search, Folder, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { locations, skillMeta } from "#constants/index.js";
import useLocationStore from "#store/location.js";
import useWindowStore from "#store/window.js";
import clsx from "clsx";

const resolveIcon = (icon) => (icon && icon.startsWith("public") ? `/${icon}` : icon);

// A project's one-line summary lives in its .txt description.
const summaryOf = (project) =>
    project.children?.find((c) => c.fileType === "txt")?.description?.[0] || "";

// Repo / demo links stored as url-type children.
const linksOf = (project) => (project.children ?? []).filter((c) => c.fileType === "url" && c.href);

const linkLabel = (link) => (/repo/i.test(link.name) ? "Repo" : "Demo");

// Full description paragraphs for the detail view.
const descriptionOf = (project) =>
    project.children?.find((c) => c.fileType === "txt")?.description ?? [];

const ProjectStack = ({ stack }) =>
    stack?.length ? (
        <div className="project-card-stack">
            {stack.map((tech) => (
                <span
                    key={tech}
                    className="project-card-tech"
                    title={skillMeta[tech] ? `${tech} · ${skillMeta[tech].category}` : tech}
                >
                    {skillMeta[tech]?.logo && <img src={skillMeta[tech].logo} alt="" loading="lazy" />}
                    <span>{tech}</span>
                </span>
            ))}
        </div>
    ) : null;

const ProjectLinks = ({ project }) =>
    linksOf(project).length ? (
        <div className="project-card-links">
            {linksOf(project).map((link) => (
                <span
                    key={link.id}
                    className="project-card-link"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(link.href, "_blank");
                    }}
                >
                    <ExternalLink size={12} />
                    {linkLabel(link)}
                </span>
            ))}
        </div>
    ) : null;

const Finder = () => {
    const { openWindow, focusWindow, focusedWindow } = useWindowStore();
    const activeLocation = useLocationStore((state) => state.activeLocation);
    const setActiveLocation = useLocationStore((state) => state.setActiveLocation);
    const goBack = useLocationStore((state) => state.goBack);
    const goForward = useLocationStore((state) => state.goForward);
    const historyIndex = useLocationStore((state) => state.historyIndex);
    const historyLength = useLocationStore((state) => state.history.length);
    const highlightIds = useLocationStore((state) => state.highlightIds);
    const setHighlightIds = useLocationStore((state) => state.setHighlightIds);
    const [query, setQuery] = useState("");
    const contentRef = useRef(null);

    const isFinderFocused = focusedWindow === "finder";
    const canGoBack = historyIndex > 0;
    const canGoForward = historyIndex < historyLength - 1;

    const isWorkRoot = activeLocation?.type === "work";
    const project = isWorkRoot ? null : locations.work.children.find((p) => p.id === activeLocation?.id);
    const isProjectView = !!project;

    // Smooth-scroll to the first highlighted project and clear the highlight shortly after.
    useEffect(() => {
        if (!highlightIds.length) return;
        const el = contentRef.current?.querySelector(".project-card.is-highlighted");
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        const t = setTimeout(() => setHighlightIds([]), 5000);
        return () => clearTimeout(t);
    }, [highlightIds, setHighlightIds]);

    // Arrow keys move focus between project cards (Enter opens the focused card natively).
    useEffect(() => {
        if (!isFinderFocused) return;
        const onKey = (e) => {
            const t = e.target;
            if (
                t instanceof HTMLElement &&
                t.closest("input, textarea, select, [contenteditable='true'], .spotlight-overlay, .tray-popover, .mobile-window-switcher, .power-menu, .desktop-menu")
            ) {
                return;
            }
            const cards = contentRef.current?.querySelectorAll(".project-card");
            if (!cards || cards.length === 0) return;

            const isArrow = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(e.key);
            if (!isArrow) return;

            e.preventDefault();
            const current = Array.from(cards).findIndex((c) => c === document.activeElement);
            let next;
            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                next = current < 0 ? 0 : (current + 1) % cards.length;
            } else {
                next = current < 0 ? cards.length - 1 : (current - 1 + cards.length) % cards.length;
            }
            cards[next]?.focus();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isFinderFocused]);

    const openItem = (item) => {
        if (item.fileType === "pdf") {
            openWindow("resume", item);
            focusWindow("resume");
            return;
        }
        if (item.fileType === "txt") {
            openWindow("txtfile", item);
            focusWindow("txtfile");
            return;
        }
        if (item.fileType === "img") {
            openWindow("imgfile", item);
            focusWindow("imgfile");
            return;
        }
        if (item.kind === "folder") return setActiveLocation(item);
        if (["fig", "url"].includes(item.fileType) && item.href) return window.open(item.href, "_blank");
    };

    // Work root → projects grouped by category, filterable.
    const groupedProjects = useMemo(() => {
        if (!isWorkRoot) return [];
        const q = query.trim().toLowerCase();
        const projects = (activeLocation.children ?? []).filter(
            (p) =>
                !q ||
                p.name.toLowerCase().includes(q) ||
                summaryOf(p).toLowerCase().includes(q) ||
                (p.category || "").toLowerCase().includes(q)
        );
        const groups = {};
        projects.forEach((p) => {
            const cat = p.category || "Other";
            (groups[cat] ||= []).push(p);
        });
        return Object.entries(groups);
    }, [activeLocation, isWorkRoot, query]);

    // Any other location → its children (files / nested folders).
    const visibleItems = useMemo(() => {
        if (isWorkRoot || isProjectView) return [];
        const q = query.trim().toLowerCase();
        return (activeLocation?.children ?? []).filter(
            (item) => !q || item.name.toLowerCase().includes(q)
        );
    }, [activeLocation, isWorkRoot, isProjectView, query]);

    const isActive = (item) =>
        item?.id === activeLocation?.id || (item?.type === "work" && isProjectView);

    return (
        <>
            <div id="window-header">
                <WindowsControls target="finder" />
                <h2>Portfolio</h2>
                <div className="finder-search">
                    <Search size={13} />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search…"
                        aria-label="Search"
                    />
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                <div className="sidebar">
                    <div className="sidebar-nav" role="group" aria-label="Navigation history">
                        <button
                            type="button"
                            className="sidebar-nav-btn"
                            onClick={() => { setQuery(""); goBack(); }}
                            disabled={!canGoBack}
                            aria-label="Back"
                            title="Back"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        <button
                            type="button"
                            className="sidebar-nav-btn"
                            onClick={() => { setQuery(""); goForward(); }}
                            disabled={!canGoForward}
                            aria-label="Forward"
                            title="Forward"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                    <div>
                        <h3>Locations</h3>
                        <ul>
                            {Object.values(locations).map((item) => (
                                <li
                                    key={item.id}
                                    onClick={() => setActiveLocation(item)}
                                    className={clsx(
                                        "cursor-pointer flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                                        isActive(item) ? "active" : "hover:bg-white/5"
                                    )}
                                >
                                    <img src={resolveIcon(item.icon)} className="w-4" alt={item.name} />
                                    <p className="text-sm font-medium">{item.name}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="content" ref={contentRef}>
                    {isProjectView ? (
                        <div className="project-detail">
                            <button
                                type="button"
                                className="project-detail-back"
                                onClick={() => { setQuery(""); goBack(); }}
                            >
                                <ChevronLeft size={14} />
                                Back
                            </button>
                            <header className="project-detail-head">
                                <h3>{project.name}</h3>
                                <span className="project-card-category">{project.category}</span>
                            </header>
                            <div className="project-detail-desc">
                                {descriptionOf(project).map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                            <ProjectStack stack={project.stack} />
                            <ProjectLinks project={project} />
                        </div>
                    ) : isWorkRoot ? (
                        groupedProjects.length === 0 ? (
                            <div className="finder-empty">
                                {query.trim() ? `No matches for "${query.trim()}"` : "No projects yet"}
                            </div>
                        ) : (
                            groupedProjects.map(([category, projects]) => (
                                <section key={category} className="project-group">
                                    <h3 className="project-group-title">{category}</h3>
                                    <div className="project-grid">
                                        {projects.map((project) => (
                                            <button
                                                key={project.id}
                                                type="button"
                                                className={clsx("project-card", highlightIds.includes(project.id) && "is-highlighted")}
                                                onClick={() => { setQuery(""); setActiveLocation(project); }}
                                            >
                                                <div className="project-card-head">
                                                    <Folder strokeWidth={1.6} className="w-5 text-zinc-400 shrink-0" />
                                                    <span className="project-card-category">{project.category}</span>
                                                </div>
                                                <h4>{project.name}</h4>
                                                <p className="project-card-summary">{summaryOf(project)}</p>
                                                <ProjectStack stack={project.stack} />
                                                <ProjectLinks project={project} />
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))
                        )
                    ) : visibleItems.length === 0 ? (
                        <div className="finder-empty">
                            {query.trim() ? `No matches for "${query.trim()}"` : "This folder is empty"}
                        </div>
                    ) : (
                        <div className="finder-grid">
                            {visibleItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="finder-item"
                                    onClick={() => openItem(item)}
                                    title={item.name}
                                >
                                    {item.kind === "folder" ? (
                                        <Folder strokeWidth={1.4} className="finder-folder-icon" />
                                    ) : (
                                        <img src={resolveIcon(item.icon)} alt={item.name} />
                                    )}
                                    <p>{item.name}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const FinderWindow = WindowWrapper(Finder, "finder");
export default FinderWindow;

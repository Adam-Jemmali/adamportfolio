import { createElement, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import {
    Sun,
    UserRound,
    Volume2,
    Volume1,
    VolumeX,
    Wifi,
    WifiOff,
    Lock,
    RotateCw,
    CircleUserRound,
    Search,
    Menu,
} from "lucide-react";
import { navLinks, locations, wallpapers } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import useSystemStore from "#store/system.js";
import PowerMenu from "./PowerMenu.jsx";

// A single top-bar control that opens a popover panel.
const TrayControl = ({ icon, label, active, onToggle, children, className = "" }) => (
    <div className={`tray-control ${className}`}>
        <button
            type="button"
            className={`topbar-action ${active ? "topbar-action-active" : ""}`}
            onClick={onToggle}
            aria-label={label}
            title={label}
            aria-expanded={active}
        >
            {createElement(icon, { size: 15 })}
        </button>
        {active && <div className="tray-popover">{children}</div>}
    </div>
);

const TrayHeader = ({ children }) => <p className="tray-title">{children}</p>;

const Slider = ({ value, onChange, icon, ariaLabel }) => (
    <div className="tray-slider-row">
        {icon}
        <input
            type="range"
            min="0"
            max="100"
            value={value}
            aria-label={ariaLabel}
            onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="tray-value">{value}%</span>
    </div>
);

const WINDOW_NAMES = {
    finder: "Portfolio",
    contact: "Contact & Booking",
    resume: "Resume",
    safari: "Web",
    photos: "Photos",
    terminal: "Terminal",
    txtfile: "Text document",
    imgfile: "Image preview",
    snake: "Snake",
    games: "Games",
    code: "Code Racer",
    journey: "Journey",
};

const TopBar = () => {
    const { openWindow, focusWindow, restoreWindow, windows } = useWindowStore();

    const wifiOn = useSystemStore((s) => s.wifiOn);
    const toggleWifi = useSystemStore((s) => s.toggleWifi);
    const brightness = useSystemStore((s) => s.brightness);
    const setBrightness = useSystemStore((s) => s.setBrightness);
    const volume = useSystemStore((s) => s.volume);
    const muted = useSystemStore((s) => s.muted);
    const setVolume = useSystemStore((s) => s.setVolume);
    const toggleMute = useSystemStore((s) => s.toggleMute);
    const lock = useSystemStore((s) => s.lock);
    const restart = useSystemStore((s) => s.restart);
    const wallpaper = useSystemStore((s) => s.wallpaper);
    const setWallpaper = useSystemStore((s) => s.setWallpaper);

    const [time, setTime] = useState(dayjs());
    const [openPanel, setOpenPanel] = useState(null); // null | "wifi" | "volume" | "brightness" | "profile"
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const trayRef = useRef(null);

    useEffect(() => {
        const id = setInterval(() => setTime(dayjs()), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        if (!openPanel && !switcherOpen) return;

        const onPointerDown = (e) => {
            if (trayRef.current && !trayRef.current.contains(e.target)) {
                setOpenPanel(null);
                setSwitcherOpen(false);
            }
        };
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                setOpenPanel(null);
                setSwitcherOpen(false);
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [openPanel, switcherOpen]);

    const togglePanel = (panel) => {
        setSwitcherOpen(false);
        setOpenPanel((p) => (p === panel ? null : panel));
    };

    const openWindows = Object.entries(windows)
        .filter(([, win]) => win.isOpen)
        .sort(([, a], [, b]) => b.zIndex - a.zIndex);

    const switchToWindow = (key) => {
        const win = windows[key];
        if (!win) return;
        if (win.minimized) restoreWindow(key);
        else focusWindow(key);
        setSwitcherOpen(false);
    };

    const openAbout = () => {
        setOpenPanel(null);
        const aboutTxt = locations.about.children?.find((c) => c.fileType === "txt");
        openWindow("txtfile", aboutTxt);
        focusWindow("txtfile");
    };

    // Which icon reflects the live state.
    const WifiIcon = wifiOn ? Wifi : WifiOff;
    const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

    return (
        <header id="topbar">
            <div className="topbar-left">
                <button type="button" className="topbar-logo" onClick={restart} title="Restart">
                    <span className="logo-badge">MJ</span>
                </button>
                <nav>
                    {navLinks.map(({ id, name, type }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => {
                                openWindow(type);
                                focusWindow(type);
                            }}
                        >
                            {name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="topbar-right" ref={trayRef}>
                <button
                    type="button"
                    className="topbar-action mobile-window-switcher-trigger"
                    onClick={() => {
                        setOpenPanel(null);
                        setSwitcherOpen((open) => !open);
                    }}
                    aria-label="Open windows"
                    title="Open windows"
                    aria-expanded={switcherOpen}
                >
                    <Menu size={15} />
                </button>

                {switcherOpen && (
                    <div className="mobile-window-switcher" role="dialog" aria-label="Open windows">
                        <p className="tray-title">Open windows</p>
                        {openWindows.length === 0 ? (
                            <p className="mobile-window-empty">No windows open</p>
                        ) : (
                            openWindows.map(([key, win]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`mobile-window-item ${win.minimized ? "minimized" : ""}`}
                                    onClick={() => switchToWindow(key)}
                                >
                                    <span className="mobile-window-status" />
                                    <span className="flex-1 truncate text-left">{WINDOW_NAMES[key] || key}</span>
                                    {win.minimized && <span className="mobile-window-state">Minimized</span>}
                                </button>
                            ))
                        )}
                        {openWindows.length > 1 && (
                            <p className="mobile-window-hint">Swipe left or right over a window to switch.</p>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    className="topbar-action spotlight-trigger"
                    onClick={() => window.dispatchEvent(new CustomEvent("spotlight:open"))}
                    aria-label="Search apps and files"
                    title="Search apps and files"
                >
                    <Search size={15} />
                </button>

                {/* Wi-Fi */}
                <TrayControl
                    icon={WifiIcon}
                    label="Wi-Fi"
                    className="tray-aux"
                    active={openPanel === "wifi"}
                    onToggle={() => togglePanel("wifi")}
                >
                    <TrayHeader>Wi-Fi</TrayHeader>
                    <button type="button" className="tray-toggle-row" onClick={toggleWifi}>
                        <span className={wifiOn ? "status-dot on" : "status-dot off"} />
                        <span className="flex-1 text-left">
                            <span className="block text-[13px] font-medium">
                                {wifiOn ? "Connected" : "Disconnected"}
                            </span>
                            <span className="block text-[11px] text-zinc-400">
                                {wifiOn ? "madajhome 5GHz" : "Airplane mode"}
                            </span>
                        </span>
                        <span className={`tray-switch ${wifiOn ? "on" : ""}`}>
                            <span className="tray-switch-knob" />
                        </span>
                    </button>
                </TrayControl>

                {/* Sound */}
                <TrayControl
                    icon={VolumeIcon}
                    label="Sound"
                    className="tray-aux"
                    active={openPanel === "volume"}
                    onToggle={() => togglePanel("volume")}
                >
                    <TrayHeader>Sound</TrayHeader>
                    <button type="button" className="tray-toggle-row" onClick={toggleMute}>
                        <VolumeIcon size={16} className="text-zinc-300" />
                        <span className="flex-1 text-left text-[13px] font-medium">
                            {muted ? "Muted" : "Playing nice & loud"}
                        </span>
                        <span className={`tray-switch ${!muted ? "on" : ""}`}>
                            <span className="tray-switch-knob" />
                        </span>
                    </button>
                    <Slider
                        value={muted ? 0 : volume}
                        onChange={setVolume}
                        icon={<Volume1 size={15} className="text-zinc-400 shrink-0" />}
                        ariaLabel="Volume"
                    />
                </TrayControl>

                {/* Brightness */}
                <TrayControl
                    icon={Sun}
                    label="Brightness"
                    className="tray-aux"
                    active={openPanel === "brightness"}
                    onToggle={() => togglePanel("brightness")}
                >
                    <TrayHeader>Brightness</TrayHeader>
                    <Slider
                        value={brightness}
                        onChange={setBrightness}
                        icon={<Sun size={15} className="text-zinc-400 shrink-0" />}
                        ariaLabel="Brightness"
                    />
                    <p className="tray-hint">
                        {brightness <= 30
                            ? "Moody. I respect it."
                            : brightness >= 90
                            ? "Full blast. Like my debug console."
                            : "Comfy glow."}
                    </p>
                </TrayControl>

                {/* Profile */}
                <TrayControl
                    icon={UserRound}
                    label="Profile"
                    active={openPanel === "profile"}
                    onToggle={() => togglePanel("profile")}
                >
                    <div className="profile-head">
                        <span className="lock-initials size-9! text-sm">MJ</span>
                        <div className="leading-tight">
                            <p className="text-[13px] font-semibold text-white">Adam J.</p>
                            <p className="text-[11px] text-zinc-400">@madajbuilds</p>
                        </div>
                    </div>
                    <div className="profile-wallpapers">
                        <p className="tray-title">Wallpaper</p>
                        {wallpapers.map((wp) => (
                            <button
                                key={wp.id}
                                type="button"
                                className="profile-wallpaper"
                                onClick={() => setWallpaper(wp.id)}
                            >
                                <span className="desktop-menu-swatch" style={{ background: wp.value }} />
                                <span>{wp.name}</span>
                                {wallpaper === wp.id && <span className="text-green-400 ml-auto">✓</span>}
                            </button>
                        ))}
                    </div>
                    <div className="profile-menu">
                        <button type="button" onClick={openAbout}>
                            <CircleUserRound size={15} />
                            About me
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOpenPanel(null);
                                lock();
                            }}
                        >
                            <Lock size={15} />
                            Lock screen
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOpenPanel(null);
                                restart();
                            }}
                        >
                            <RotateCw size={15} />
                            Restart
                        </button>
                    </div>
                </TrayControl>

                <span className="topbar-clock">{time.format("ddd MMM D  h:mm A")}</span>
                <PowerMenu />
            </div>
        </header>
    );
};

export default TopBar;

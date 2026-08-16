import { create } from "zustand";

const CUSTOM_WALLPAPERS_KEY = "mj-custom-wallpapers";

const loadCustomWallpapers = () => {
    try {
        const raw = localStorage.getItem(CUSTOM_WALLPAPERS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.filter((w) => w && w.id && w.value)
            : [];
    } catch {
        return [];
    }
};

const persistCustomWallpapers = (items) => {
    try {
        localStorage.setItem(CUSTOM_WALLPAPERS_KEY, JSON.stringify(items));
    } catch {
        // Storage unavailable/full — custom wallpapers just won't persist.
    }
};

// Screen flow: boot -> lock -> desktop, with suspend/restarting as side states.
const useSystemStore = create((set, get) => ({
    screen: "boot", // "boot" | "lock" | "desktop" | "suspend" | "restarting"
    powerMenuOpen: false,

    // System tray state
    wifiOn: true,
    brightness: 100, // 0 – 100
    volume: 65, // 0 – 100
    muted: false,
    wallpaper: "aurora",
    customWallpapers: loadCustomWallpapers(),

    toggleWifi: () => set((s) => ({ wifiOn: !s.wifiOn })),
    setBrightness: (value) => set({ brightness: Math.max(0, Math.min(100, value)) }),
    setVolume: (value) => set({ volume: Math.max(0, Math.min(100, value)), muted: false }),
    toggleMute: () => set((s) => ({ muted: !s.muted })),
    setWallpaper: (id) => set({ wallpaper: id }),

    addWallpaper: (wp) => {
        const item = { id: wp.id, name: wp.name, type: "image", value: wp.value };
        const next = [
            ...get().customWallpapers.filter((w) => w.id !== item.id),
            item,
        ];
        persistCustomWallpapers(next);
        set({ customWallpapers: next, wallpaper: item.id });
    },

    removeWallpaper: (id) => {
        const next = get().customWallpapers.filter((w) => w.id !== id);
        persistCustomWallpapers(next);
        set({
            customWallpapers: next,
            wallpaper: get().wallpaper === id ? "aurora" : get().wallpaper,
        });
    },

    bootDone: () => set({ screen: "lock" }),
    unlock: () => set({ screen: "desktop", powerMenuOpen: false }),
    lock: () => set({ screen: "lock", powerMenuOpen: false }),
    suspend: () => set({ screen: "suspend", powerMenuOpen: false }),
    wake: () => set({ screen: "lock" }),
    restart: () => set({ screen: "restarting", powerMenuOpen: false }),

    togglePowerMenu: () => set((state) => ({ powerMenuOpen: !state.powerMenuOpen })),
    closePowerMenu: () => set({ powerMenuOpen: false }),
}));

export default useSystemStore;

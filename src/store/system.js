import { create } from "zustand";

// Screen flow: boot -> lock -> desktop, with suspend/restarting as side states.
const useSystemStore = create((set) => ({
    screen: "boot", // "boot" | "lock" | "desktop" | "suspend" | "restarting"
    powerMenuOpen: false,

    // System tray state
    wifiOn: true,
    brightness: 100, // 0 – 100
    volume: 65, // 0 – 100
    muted: false,

    toggleWifi: () => set((s) => ({ wifiOn: !s.wifiOn })),
    setBrightness: (value) => set({ brightness: Math.max(0, Math.min(100, value)) }),
    setVolume: (value) => set({ volume: Math.max(0, Math.min(100, value)), muted: false }),
    toggleMute: () => set((s) => ({ muted: !s.muted })),

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

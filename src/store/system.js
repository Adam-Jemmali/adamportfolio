import { create } from "zustand";

// Screen flow: boot -> lock -> desktop, with suspend/restarting as side states.
const useSystemStore = create((set) => ({
    screen: "boot", // "boot" | "lock" | "desktop" | "suspend" | "restarting"
    powerMenuOpen: false,

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

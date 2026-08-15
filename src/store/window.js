import {create} from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

import {INITIAL_Z_INDEX, WINDOW_CONFIG} from "#constants/index.js";

const focusTopWindow = (state) => {
    const next = Object.entries(state.windows)
        .filter(([, win]) => win.isOpen && !win.minimized)
        .sort(([, a], [, b]) => b.zIndex - a.zIndex)[0];

    if (!next) {
        state.focusedWindow = null;
        return;
    }

    state.focusedWindow = next[0];
    next[1].zIndex = state.nextZIndex++;
};

const useWindowStore = create(persist(immer((set) => ({
    windows: WINDOW_CONFIG,
    nextZIndex: INITIAL_Z_INDEX + 1,
    focusedWindow: null,

    openWindow: (windowKey, data = null) => set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.isOpen = true;
        win.minimized = false;
        win.zIndex = state.nextZIndex++;
        win.data = data ?? win.data;
        state.focusedWindow = windowKey;
    }),

    closeWindow: (windowKey) => set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.isOpen = false;
        win.minimized = false;
        win.maximized = false;
        win.zIndex = INITIAL_Z_INDEX;
        win.data = null;
        if (state.focusedWindow === windowKey) focusTopWindow(state);
    }),

    closeAllWindows: () => set((state) => {
        Object.values(state.windows).forEach((win) => {
            win.isOpen = false;
            win.minimized = false;
            win.maximized = false;
            win.zIndex = INITIAL_Z_INDEX;
            win.data = null;
        });
        state.focusedWindow = null;
    }),

    minimizeWindow: (windowKey) => set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.minimized = true;
        win.maximized = false;
        if (state.focusedWindow === windowKey) focusTopWindow(state);
    }),

    restoreWindow: (windowKey) => set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.minimized = false;
        win.zIndex = state.nextZIndex++;
        state.focusedWindow = windowKey;
    }),

    toggleMaximize: (windowKey) => set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.maximized = !win.maximized;
        win.minimized = false;
        state.focusedWindow = windowKey;
    }),

    focusWindow: (windowKey) => set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.zIndex = state.nextZIndex++;
        state.focusedWindow = windowKey;
    }),
})), {
    name: "mj-windows",
    partialize: (state) => ({ windows: state.windows, nextZIndex: state.nextZIndex }),
}));

export default useWindowStore;

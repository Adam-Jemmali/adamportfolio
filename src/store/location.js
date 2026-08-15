import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { locations } from "#constants/index.js";

// Resolve a persisted location id back to the live object in the data tree.
const findLocationById = (id) => {
    if (!id) return null;
    for (const loc of Object.values(locations)) {
        if (loc.id === id) return loc;
    }
    return locations.work.children?.find((p) => p.id === id) ?? null;
};

const useLocationStore = create(
    persist(
        immer((set) => ({
            activeLocation: locations.work,
            // Project ids to briefly highlight in the Portfolio (set by Journey skill chips).
            highlightIds: [],
            // Back/forward navigation history (Finder-style).
            history: [locations.work],
            historyIndex: 0,

            // Navigate to a location and record it in the history (truncating any forward branch).
            setActiveLocation: (location = null) => set((state) => {
                if (!location || state.activeLocation?.id === location.id) return;
                state.history = state.history.slice(0, state.historyIndex + 1);
                state.history.push(location);
                state.historyIndex = state.history.length - 1;
                state.activeLocation = location;
                state.highlightIds = [];
            }),

            goBack: () => set((state) => {
                if (state.historyIndex <= 0) return;
                state.historyIndex -= 1;
                state.activeLocation = state.history[state.historyIndex];
                state.highlightIds = [];
            }),

            goForward: () => set((state) => {
                if (state.historyIndex >= state.history.length - 1) return;
                state.historyIndex += 1;
                state.activeLocation = state.history[state.historyIndex];
                state.highlightIds = [];
            }),

            setHighlightIds: (ids = []) => set((state) => {
                state.highlightIds = ids;
            }),

            resetActivateLocation: () => set((state) => {
                state.activeLocation = locations.work;
                state.highlightIds = [];
                state.history = [locations.work];
                state.historyIndex = 0;
            }),
        })),
        {
            name: "mj-location",
            partialize: (state) => ({ activeLocationId: state.activeLocation?.id ?? null }),
            merge: (persisted, current) => {
                const loc = findLocationById(persisted?.activeLocationId) ?? locations.work;
                return {
                    ...current,
                    activeLocation: loc,
                    highlightIds: [],
                    history: [loc],
                    historyIndex: 0,
                };
            },
        }
    )
);

export default useLocationStore;

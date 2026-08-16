import { create } from "zustand";

// Trappie — the guided tour of the OS. Tracks whether the tour is running and
// which step is currently shown; the step definitions live in TourGuide.jsx.
const useTourStore = create((set) => ({
    active: false,
    step: 0,

    start: () => set({ active: true, step: 0 }),
    next: () => set((s) => ({ step: s.step + 1 })),
    back: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
    goTo: (step) => set({ step: Math.max(0, step) }),
    end: () => set({ active: false, step: 0 }),
}));

export default useTourStore;

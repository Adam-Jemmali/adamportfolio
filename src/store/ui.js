import { create } from "zustand";

const useUIStore = create((set) => ({
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),
}));

export default useUIStore;

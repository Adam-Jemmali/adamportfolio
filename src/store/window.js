import {create} from "zustand";
import { immer } from "zustand/middleware/immer";

import {INITIAL_Z_INDEX, WINDOW_CONFIG} from "#constants/index.js";
const useWindowStore= create(immer((set)=>({
    windows:WINDOW_CONFIG,
        nextZIndex: INITIAL_Z_INDEX+1,
    openWindow: (windowKey,data=null) => set((state) => {
        const win= state.windows[windowKey];
        win.isOpen= true;
        win.zIndex= state.nextZIndex++;
        win.data=data ?? win.data;
        state.focusedWindow = windowKey;

    }),
        closeWindow: (windowKey) => set((state) => {
            const win= state.windows[windowKey];
            win.isOpen= false;
            win.zIndex= INITIAL_Z_INDEX;
            win.data=null;
            if (state.focusedWindow === windowKey) {
                state.focusedWindow = null;
            }



}),
    focusWindow: (windowKey,data=null) => set((state) => {
        const win= state.windows[windowKey];

        win.zIndex= state.nextZIndex++;
        state.focusedWindow = windowKey;

}),
    focusedWindow: null,


}) ));

export default useWindowStore;








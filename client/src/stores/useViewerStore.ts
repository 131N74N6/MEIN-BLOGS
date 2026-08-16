import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ViewerState {
    userId: string;
    setUserId: (userId: string) => void;

    resetViewerState: () => void;
}

export const useViewerStore = create<ViewerState>()(persist((set) => ({
    userId: "",
    setUserId: (userId: string) => set({ userId }),

    resetViewerState: () => set({
        userId: ""
    })
}), {
        name: "viewer",
        partialize: (state: ViewerState) => ({ userId: state.userId})
    }
));
import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { ViewerMessage, ViewerUnion } from "./model";

const viewerMessageSlice: StateCreator<ViewerMessage> = (set) => ({
    viewerMessage: null,
    setViewerMessage: (viewerMessage) => set({ viewerMessage }),
});

export const useViewerStore = create<ViewerUnion>()((...x) => ({
    ...viewerMessageSlice(...x)
}));
import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { CommenInputState, Union } from "./model";

const commentInputSlice: StateCreator<CommenInputState> = (set) => ({
    text: "",
    setText: (text: string) => set({ text }),

    resetCommentState: () => set({
        text: ""
    }),
});

export const useCommentStore = create<Union>()((...x) => ({
    ...commentInputSlice(...x)
}));
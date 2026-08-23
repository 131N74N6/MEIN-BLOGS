import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { CommenInputState, CommentMessageState, Union } from "./model";

const commentInputSlice: StateCreator<CommenInputState> = (set) => ({
    text: "",
    setText: (text: string) => set({ text }),

    resetCommentState: () => set({
        text: ""
    }),
});

const commentMessageSlice: StateCreator<CommentMessageState> = (set) => ({
    commentMessage: null,
    setCommentMessage: (commentMessage: string | null) => set({ commentMessage }),
});

export const useCommentStore = create<Union>()((...x) => ({
    ...commentInputSlice(...x),
    ...commentMessageSlice(...x)
}));
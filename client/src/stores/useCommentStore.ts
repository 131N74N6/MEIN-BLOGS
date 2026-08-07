import { create } from "zustand";

export interface CommentState {
    text: string;
    setText: (text: string) => void;

    resetCommentState: () => void;
}

export const useCommentStore = create<CommentState>((set) => ({
    text: "",
    setText: (text: string) => set({text }),

    resetCommentState: () => set({
        text: ""
    }),
}));
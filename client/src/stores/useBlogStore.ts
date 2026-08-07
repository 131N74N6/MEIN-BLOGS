import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand";

export interface BlogInfoState {
    content: string;
    setContent: (content: string) => void;

    media: File | null;
    setMedia: (media: File | null) => void;

    resetBlogInfoState: () => void;

    title: string;
    setTitle: (title: string) => void;
}

interface BlogWindowState {
    blogId: string;
    setBlogId: (blogId: string) => void;
    resetBlogWindowState: () => void;
}

const useBlogInfoSlice: StateCreator<BlogInfoState> = (set) => ({
    content: "",
    setContent: (content: string) => set({ content }),

    media: null,
    setMedia: (media: File | null) => set({ media }),

    resetBlogInfoState: () => set({
        content: "",
        media: null,
        title: ""
    }),

    title: "",
    setTitle: (title: string) => set({ title })
});

const useBlogWindowSlice: StateCreator<BlogWindowState> = (set) => ({
    blogId: "",
    setBlogId: (blogId: string) => set({ blogId }),

    resetBlogWindowState: () => set({
        blogId: ""
    })
});

export const useBlogStore = create<BlogInfoState & BlogWindowState>()(persist(
    (...x) => ({
        ...useBlogInfoSlice(...x),
        ...useBlogWindowSlice(...x)
    }),
    { 
        name: "blog_id",
        partialize: (state) => ({ blogId: state.blogId }),
    }
));
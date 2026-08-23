import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand";
import type { BlogInfoState, BlogMessageState, BlogWindowState } from "./model";

type Union = BlogInfoState & BlogWindowState & BlogMessageState;

const blogInfoSlice: StateCreator<BlogInfoState> = (set) => ({
    blogIdToggle: (blogIdParam: string) => set((state) => ({
        chosenBlogsIds: state.chosenBlogsIds.includes(blogIdParam) ?
        state.chosenBlogsIds.filter(blogId => blogId !== blogIdParam) : 
        [...state.chosenBlogsIds, blogIdParam]
    })),

    chosenBlogsIds: [],
    resetChosenBlogsIds: () => set({ chosenBlogsIds: [] }),

    content: "",
    setContent: (content: string) => set({ content }),

    media: null,
    setMedia: (media: File | null) => set({ media }),

    mediaUrl: null,
    setMediaUrl: (mediaUrl: string | null) => set({ mediaUrl }),

    language: "",
    setLanguage: (language: string) => set({ language }),

    resetBlogInfoState: () => set({
        chosenBlogsIds: [],
        content: "",
        media: null,
        mediaUrl: null,
        language: "",
        title: ""
    }),

    selectMode: false,
    setSelectMode: (selectMode: boolean) => set({ selectMode }),

    title: "",
    setTitle: (title: string) => set({ title })
});

const blogWindowSlice: StateCreator<BlogWindowState> = (set) => ({
    blogId: "",
    setBlogId: (blogId: string) => set({ blogId }),

    resetBlogWindowState: () => set({
        blogId: ""
    })
});

const blogMessageSlice: StateCreator<BlogMessageState> = (set) => ({
    blogMessage: null,
    setBlogMessage: (blogMessage: string | null) => set({ blogMessage })
});

export const useBlogStore = create<Union>()(persist((...x) => ({
    ...blogInfoSlice(...x),
    ...blogMessageSlice(...x),
    ...blogWindowSlice(...x)
}),
{ 
    name: "blog_id",
    partialize: (state) => ({ blogId: state.blogId }),
}
));
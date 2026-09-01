import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StateCreator } from "zustand";
import type { BlogInfoState, BlogWindowState, EditBlogState } from "./model";

type Union = BlogInfoState & BlogWindowState & EditBlogState & EditBlogState;

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
        searched: "",
        title: ""
    }),

    searched: "",
    setSearched: (searched: string) => set({ searched }),

    selectMode: false,
    setSelectMode: (selectMode: boolean) => set({ selectMode }),

    title: "",
    setTitle: (title: string) => set({ title })
});

const blogWindowSlice: StateCreator<BlogWindowState> = (set) => ({
    blogId: undefined,
    setBlogId: (blogId: string | undefined) => set({ blogId }),

    blogOwnerId: undefined,
    setBlogOwnerId: (blogOwnerId: string | undefined) => set({ blogOwnerId }),

    resetBlogWindowState: () => set({
        blogId: undefined,
        blogOwnerId: undefined
    })
});

const editBlogSlice: StateCreator<EditBlogState> = (set) => ({
    newContent: "",
    setNewContent: (newContent: string) => set({ newContent }),

    newMedia: null,
    setNewMedia: (newMedia: File | null) => set({ newMedia }),

    newMediaUrl: null,
    setNewMediaUrl: (newMediaUrl: string | null) => set({ newMediaUrl }),

    newLanguage: "",
    setNewLanguage: (newLanguage: string) => set({ newLanguage }),

    resetEditBlogState: () => set({
        newContent: "",
        newMedia: null,
        newMediaUrl: null,
        newLanguage: "",
        newTitle: ""
    }),

    newTitle: "",
    setNewTitle: (newTitle: string) => set({ newTitle })
});

export const useBlogStore = create<Union>()(persist((...x) => ({
    ...blogInfoSlice(...x),
    ...blogWindowSlice(...x),
    ...editBlogSlice(...x)
}), { 
    name: "blog_data",
    partialize: (state) => ({ 
        blogId: state.blogId, 
        blogOwnerId: state.blogOwnerId 
    }),
}));
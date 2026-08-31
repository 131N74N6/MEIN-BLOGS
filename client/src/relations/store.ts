import { create } from "zustand";
import type { RelationState } from "./model";

export const useRelationStore = create<RelationState>((set) => ({
    searchUser: "",
    setSearchUser: (searchUser: string) => set({ searchUser }),

    resetRelationState: () => set({
        searchUser: ""
    })
}));
import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { Union, UserIdInput, UserProfileState } from "./model";
import { persist } from "zustand/middleware";

const userWindowSlice: StateCreator<UserIdInput> = (set) => ({
    currentUserId: undefined,
    setCurrentUserId: (currentUserId) => set({ currentUserId }),

    otherUserId: undefined,
    setOtherUserId: (otherUserId: string | undefined) => set({ otherUserId }),

    resetUserIdState: () => set({
        currentUserId: undefined,
        otherUserId: undefined
    })
});

const userProfileSlice: StateCreator<UserProfileState> = (set) => ({
    deleteProfilePcture: null,
    setDeleteProfilePcture: (deleteProfilePcture: { 
        filename: string; 
        filetype: string; 
        public_id: string; 
        resource_type: string; 
        url: string; } | null
    ) => set({ deleteProfilePcture }),

    newProfilePcture: null,
    setNewProfilePcture: (newProfilePcture: File | null) => set({ newProfilePcture }),
    
    newProfilePctureUrl: null,
    setNewProfilePctureUrl: (newProfilePctureUrl: string | null) => set({ newProfilePctureUrl }),

    newUserName: "",
    setNewUserName: (newUserName: string) => set({ newUserName }),

    oldProfilePcture: null,
    setOldProfilePcture: (oldProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null) => set({ oldProfilePcture }),

    resetUserProfileState: () => set({
        deleteProfilePcture: null,
        newProfilePcture: null,
        newProfilePctureUrl: null,
        newUserName: "",
        oldProfilePcture: null
    }),
});

export const useUserStore = create<Union>()(persist((...x) => ({
    ...userProfileSlice(...x),
    ...userWindowSlice(...x)
}), {
    name: "user",
    partialize: (state) => ({ 
        currentUserId: state.currentUserId,
        otherUserId: state.otherUserId 
    })
}));
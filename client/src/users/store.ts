import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { Union, UserIdInput, UserMessage, UserProfileState } from "./model";

const userIdSlice: StateCreator<UserIdInput> = (set) => ({
    currentUserId: "",
    setCurrentUserId: (currentUserId) => set({ currentUserId }),

    resetUserIdState: () => set({
        currentUserId: ""
    })
});

const userMessageSlice: StateCreator<UserMessage> = (set) => ({
    userMessage: null,
    setUserMessage: (userMessage: string | null) => set({ userMessage })
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

export const useUserStore = create<Union>()((...x) => ({
    ...userMessageSlice(...x),
    ...userProfileSlice(...x),
    ...userIdSlice(...x)
}));
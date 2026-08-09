import { create } from "zustand";
import type { StateCreator } from "zustand";

export interface UserInfoState {
    email: string;
    setEmail: (email: string) => void;

    password: string;
    setPassword: (password: string) => void;

    resetUserInfoState: () => void;

    username: string;
    setUsername: (username: string) => void;
}

export interface UserProfileState {
    deleteProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
    setDeleteProfilePcture: (deleteProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null) => void;

    newProfilePcture: File | null;
    setNewProfilePcture: (newProfilePcture: File | null) => void;

    newProfilePctureUrl: string | null;
    setNewProfilePctureUrl: (newProfilePctureUrl: string | null) => void;

    oldProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
    setOldProfilePcture: (oldProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null) => void;

    resetUserProfileState: () => void;
}

interface UserWindowState {
    currentUserId: string;
    setCurrentUserId: (currentUserId: string) => void;

    resetUserWindowState: () => void;
}

type UserStoreIntrf = UserInfoState & UserProfileState & UserWindowState;

const useUserInfoSlice: StateCreator<UserInfoState> = (set) => ({
    email: "",
    setEmail: (email: string) => set({ email }),

    password: "",
    setPassword: (password: string) => set({ password }),

    resetUserInfoState: () => set({
        email: "",
        password: "",
        username: ""
    }),

    username: "",
    setUsername: (username: string) => set({ username }),
});

const useUserProfileSlice: StateCreator<UserProfileState> = (set) => ({
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
        oldProfilePcture: null
    }),
});

const useUserWindowSlice: StateCreator<UserWindowState> = (set) => ({
    currentUserId: "",
    setCurrentUserId: (currentUserId) => set({ currentUserId }),

    resetUserWindowState: () => set({
        currentUserId: ""
    })
});

export const useUserStore = create<UserStoreIntrf>()((...x) => ({
    ...useUserInfoSlice(...x),
    ...useUserProfileSlice(...x),
    ...useUserWindowSlice(...x)
}));
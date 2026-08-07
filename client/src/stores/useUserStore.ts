import { create } from "zustand";

export interface UserState {
    email: string;
    setEmail: (email: string) => void;

    newProfilePcture: File | null;
    setNewProfilePcture: (newProfilePcture: File | null) => void;

    newProfilePctureUrl: string | null;
    setNewProfilePctureUrl: (newProfilePctureUrl: string | null) => void;

    password: string;
    setPassword: (password: string) => void;

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

    resetUserState: () => void;

    username: string;
    setUsername: (username: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
    email: "",
    setEmail: (email: string) => set({ email }),
    
    newProfilePcture: null,
    setNewProfilePcture: (newProfilePcture: File | null) => set({ newProfilePcture }),
    
    newProfilePctureUrl: null,
    setNewProfilePctureUrl: (newProfilePctureUrl: string | null) => set({ newProfilePctureUrl }),
    
    password: "",
    setPassword: (password: string) => set({ password }),
    
    oldProfilePcture: null,
    setOldProfilePcture: (oldProfilePcture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null) => set({ oldProfilePcture }),

    resetUserState: () => set({
        email: "",
        password: "",
        newProfilePcture: null,
        newProfilePctureUrl: null,
        oldProfilePcture: null,
        username: ""
    }),
    
    username: "",
    setUsername: (username: string) => set({ username }),
}));
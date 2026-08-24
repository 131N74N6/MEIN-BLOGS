import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { MessageState, NavbarState, StyleUnion } from "./model";

const messageStateSlice: StateCreator<MessageState> = (set) => ({
    message: null,
    setMessage: (message: string | null) => set({ message }),

    resetMessageState: () => set({
        message: null
    })
});

const navbarStateSlice: StateCreator<NavbarState> = (set) => ({
    isOpen: false,
    setIsOpen: (isOpen: boolean) => set({ isOpen }),

    resetNavbarState: () => set({
        isOpen: false
    })
});

export const useStyleStore = create<StyleUnion>()((...x) => ({
    ...messageStateSlice(...x),
    ...navbarStateSlice(...x)
}));
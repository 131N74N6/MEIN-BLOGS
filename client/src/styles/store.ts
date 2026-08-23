import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { NavbarState, StyleUnion } from "./model";

const navbarStateSlice: StateCreator<NavbarState> = (set) => ({
    isOpen: false,
    setIsOpen: (isOpen: boolean) => set({ isOpen }),

    resetNavbarState: () => set({
        isOpen: false
    })
});

export const useStyleStore = create<StyleUnion>()((...x) => ({
    ...navbarStateSlice(...x)
}));
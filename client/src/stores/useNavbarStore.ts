import { create } from "zustand";

export interface NavbarState {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;

    resetNavbarState: () => void;
}

export const useNavbarStore = create<NavbarState>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen: boolean) => set({ isOpen }),

    resetNavbarState: () => set({
        isOpen: false
    })
}));
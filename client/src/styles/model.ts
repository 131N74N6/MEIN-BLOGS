export type NavbarState = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;

    resetNavbarState: () => void;
}

export type StyleUnion = NavbarState;
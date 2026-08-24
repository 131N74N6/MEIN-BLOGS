export type NavbarState = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;

    resetNavbarState: () => void;
}

export type MessageState = {
    message: string | null;
    setMessage: (message: string | null) => void;

    resetMessageState: () => void;
}

export type StyleUnion = MessageState & NavbarState;
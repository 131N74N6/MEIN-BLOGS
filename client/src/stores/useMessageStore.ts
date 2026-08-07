import { create } from "zustand";

export interface MessageState {
    message: string | null;
    setMessage: (message: string | null) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
    message: null,
    setMessage: (message: string | null) => set({ message })
}));
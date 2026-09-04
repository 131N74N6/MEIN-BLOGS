import { create } from "zustand";
import type { MessageChatState } from "./model";

export const useUserChatStore = create<MessageChatState>((set) => ({
    media: [],
    setMedia: (media) => set((state) => ({ 
        media: typeof media === 'function' ? media(state.media) : media 
    })),

    messageChat: undefined,
    setMessageChat: (messageChat?: string | undefined) => set({ messageChat }),

    chosenMessageIds: [],
    setChosenMessageIds: (messageId: string) => set((state) => ({
        chosenMessageIds: state.chosenMessageIds.includes(messageId) ?
        state.chosenMessageIds.filter(chosenMessageId => chosenMessageId !== messageId) : 
        [...state.chosenMessageIds, messageId]
    })),

    selectMode: false,
    setSelectMode: (selectMode: boolean) => set({ selectMode }),

    resetMessageChatState: () => set({
        chosenMessageIds: [],
        media: [],
        messageChat: undefined,
        selectMode: false
    })
}));
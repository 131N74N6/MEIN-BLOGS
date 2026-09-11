import { create } from "zustand";
import type { MessageChatState } from "./model";
import { persist } from "zustand/middleware";

export const useUserChatStore = create<MessageChatState>()(persist((set) => ({
    chosenMessage: null,
    setChosenMessage: (chosenMessage) => set({chosenMessage }),

    chosenMessageId: "",
    setChosenMessageId: (chosenMessageId: string) => set({ chosenMessageId }),
    
    chosenMessageIds: [],
    resetChosenMessageIds: () => set({ chosenMessageIds: [] }),
    setChosenMessageIds: (messageId: string) => set((state) => ({
        chosenMessageIds: state.chosenMessageIds.includes(messageId) ?
        state.chosenMessageIds.filter(chosenMessageId => chosenMessageId !== messageId) : 
        [...state.chosenMessageIds, messageId]
    })),

    media: [],
    removeMedia: (filename: string) => set((state) => ({
        media: state.media.filter(media => media.filename !== filename)
    })),
    setMedia: (media) => set((state) => ({ 
        media: typeof media === 'function' ? media(state.media) : media 
    })),

    messageChat: undefined,
    setMessageChat: (messageChat?: string | undefined) => set({ messageChat }),

    openPopUpOption: false,
    setOpenPopUpOption: (openPopUpOption: boolean) => set({ openPopUpOption }),

    selectMode: false,
    setSelectMode: (selectMode: boolean) => set({ selectMode }),

    resetMessageChatState: () => set({
        chosenMessage: null,
        chosenMessageId: "",
        chosenMessageIds: [],
        media: [],
        messageChat: undefined,
        openPopUpOption: false,
        selectMode: false,
    })
}), {
    name: "user_chat",
    partialize: (state) => ({ chosenMessageId: state.chosenMessageId })
}));
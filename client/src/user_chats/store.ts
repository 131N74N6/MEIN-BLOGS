import { create } from "zustand";
import type { MessageChatState } from "./model";

export const useUserChatStore = create<MessageChatState>((set) => ({
    media: [],
    setMedia: (media) => set((state) => ({ 
        media: typeof media === 'function' ? media(state.media) : media 
    })),

    messageChat: undefined,
    setMessageChat: (messageChat?: string | undefined) => set({ messageChat }),

    chosenMessage: null,
    setChosenMessage: (chosenMessage) => set({chosenMessage }),

    chosenMessageIds: [],
    resetChosenMessageIds: () => set({ chosenMessageIds: [] }),
    setChosenMessageIds: (messageId: string) => set((state) => ({
        chosenMessageIds: state.chosenMessageIds.includes(messageId) ?
        state.chosenMessageIds.filter(chosenMessageId => chosenMessageId !== messageId) : 
        [...state.chosenMessageIds, messageId]
    })),

    openPopUpOption: false,
    setOpenPopUpOption: (openPopUpOption: boolean) => set({ openPopUpOption }),

    reconnectTrigger: 0,
    setReconnectTrigger: (reconnectTrigger) => set((state) => ({
        reconnectTrigger: typeof reconnectTrigger === "function" ? 
        reconnectTrigger(state.reconnectTrigger) : reconnectTrigger
    })),

    selectMode: false,
    setSelectMode: (selectMode: boolean) => set({ selectMode }),

    resetMessageChatState: () => set({
        chosenMessage: null,
        chosenMessageIds: [],
        media: [],
        messageChat: undefined,
        openPopUpOption: false,
        reconnectTrigger: 0,
        selectMode: false
    })
}));
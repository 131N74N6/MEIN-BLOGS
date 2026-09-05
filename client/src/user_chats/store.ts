import { create } from "zustand";
import type { MessageChatState } from "./model";

export const useUserChatStore = create<MessageChatState>((set) => ({
    editMessage: false,
    setEditMessage: (editMessage: boolean) => set({ editMessage }),

    media: [],
    setMedia: (media) => set((state) => ({ 
        media: typeof media === 'function' ? media(state.media) : media 
    })),

    messageChat: undefined,
    setMessageChat: (messageChat?: string | undefined) => set({ messageChat }),

    chosenMessageId: "",
    setChosenMessageId: (chosenMessageId: string) => set({ chosenMessageId }),

    chosenMessageIds: [],
    setChosenMessageIds: (messageId: string) => set((state) => ({
        chosenMessageIds: state.chosenMessageIds.includes(messageId) ?
        state.chosenMessageIds.filter(chosenMessageId => chosenMessageId !== messageId) : 
        [...state.chosenMessageIds, messageId]
    })),

    openPopUpOption: false,
    setOpenPopUpOption: (openPopUpOption: boolean) => set({ openPopUpOption }),

    selectMode: false,
    setSelectMode: (selectMode: boolean) => set({ selectMode }),

    resetMessageChatState: () => set({
        chosenMessageId: "",
        chosenMessageIds: [],
        editMessage: false,
        media: [],
        messageChat: undefined,
        openPopUpOption: false,
        selectMode: false
    })
}));
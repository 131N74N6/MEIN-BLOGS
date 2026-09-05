import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult, UseMutationResult } from "@tanstack/react-query";
import type { ApiResponse } from "../handler/api";

export type MessageChatState = {
    editMessage: boolean;
    setEditMessage: (editMessage: boolean) => void;

    media: FileViewerData[];
    setMedia: (media: FileViewerData[] | ((prev: FileViewerData[]) => FileViewerData[])) => void;

    messageChat?: string;
    setMessageChat: (messageChat: string) => void;

    chosenMessageId: string;
    setChosenMessageId: (chosenMessageId: string) => void;

    chosenMessageIds: string[];
    setChosenMessageIds: (chosenMessageId: string) => void;

    openPopUpOption: boolean;
    setOpenPopUpOption: (openPopUpOption: boolean) => void;

    selectMode: boolean;
    setSelectMode: (selectMode: boolean) => void;

    resetMessageChatState: () => void;
}

export type FileViewerData = {
    file: File;
    filename: string;
    filetype: string;
}

export type UserMessage = {
    _id: string;
    created_at: Date;
    hidden_for: string[];
    media: {
        url: string;
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
    }[];
    message: string;
    sender_id: string;
    receiver_id: string;
    updated_at: Date;
}

export type UserMessageData = {
    chosen_message_ids: string[];
    is_own: boolean;
    is_processing: boolean;
    is_select_mode: boolean;
    data: UserMessage;
    set_chosen_message_ids: (messageId: string) => void;
}

export type UserMessageDataList = {
    chosen_message_ids: string[];
    fetch_next_page: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<UserMessage[], unknown>, Error>>;
    has_next_page: boolean;
    is_fetching_next_page: boolean;
    is_own: boolean;
    is_processing: boolean;
    is_select_mode: boolean;
    messages: UserMessage[];
    set_chosen_message_ids: (messageId: string) => void;
}

export type ChatMediaMeta = {
    url: string;
    public_id: string;
    resource_type: "image" | "video" | "raw";
    filename?: string;
    filetype?: string;
}

export type ChatMessagePayload = {
    message?: string;
    receiver_id: string;
    sender_id: string;
    media?: ChatMediaMeta[];
}

export type WSMessage = {
    type: string;
    payload: ChatMessagePayload | Record<string, any>;
}

export type PopUpOptionData = {
    chosenMessageIds: string[];
    clearAll: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>;
    clearChosen: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>;
    deleteAll: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>;
    deletChosen: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>;
    isProcessing: boolean;
    setEditMode: (editMode: boolean) => void;
}

// https://open.spotify.com/intl-id/track/6RcsAN8XF5KX6mMh6dum8e?si=53bd956200ee4f9b
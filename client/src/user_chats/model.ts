import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult, UseMutationResult } from "@tanstack/react-query";
import type { ApiResponse } from "../api";

export type MessageChatState = {
    media: FileViewerData[];
    removeMedia: (filename: string) => void;
    setMedia: (media: FileViewerData[] | ((prev: FileViewerData[]) => FileViewerData[])) => void;

    messageChat?: string;
    resetChosenMessageIds: () => void;
    setMessageChat: (messageChat: string) => void;

    chosenMessage: UserMessage | null;
    setChosenMessage: (chosenMessage: UserMessage | null) => void;

    chosenMessageIds: string[];
    setChosenMessageIds: (chosenMessageId: string) => void;

    chosenMessageId: string;
    setChosenMessageId: (chosenMessageId: string) => void;

    isWebSocketConnected: boolean;
    setIsWebSocketConnected: (isWebSocketConnected: boolean) => void;

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
    url: string;
}

export type FilePreviewPlace = {
    media: FileViewerData[];
    name: "media-raw-preview";
    openFileSelector: () => void;
}

export type UploadedFileResultPlace = {
    media: ChatMediaMeta[];
    name: "media-result";
}

export type ChatMediaViewer = {
    place: FilePreviewPlace | UploadedFileResultPlace;
    is_processing: boolean;
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
    is_processing: boolean;
    is_select_mode: boolean;
    messages: UserMessage[];
    set_chosen_message_ids: (messageId: string) => void;
}

export type ChatMediaMeta = {
    url: string;
    public_id: string;
    resource_type: string;
    filename: string;
    filetype: string;
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
    deleteChosen: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>;
    isProcessing: boolean;
}
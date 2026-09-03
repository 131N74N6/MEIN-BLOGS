export type MessageChatState = {
    media: FileViewerData[];
    setMedia: (media: FileViewerData[] | ((prev: FileViewerData[]) => FileViewerData[])) => void;

    messageChat: string;
    setMessageChat: (messageChat: string) => void;

    chosenMessageIds: string[];
    setChosenMessageIds: (messageId: string) => void;

    selectMode: boolean;
    setSelectMode: (selectMode: boolean) => void;

    resetMessageChatState: () => void;
}

export type FileViewerData = {
    file: File;
    filename: string;
    filetype: string;
}

export type UserMessageData = {
    _id: string;
    created_at: Date;
    hidden_for: string[];
    media: {
        url: string;
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
    }[] | null;
    message: string;
    sender_id: string;
    receiver_id: string;
    updated_at: Date;
}

export type ChatMediaMeta = {
    url: string;
    public_id: string;
    resource_type: "image" | "video" | "raw";
    original_name?: string;
}

export type ChatMessagePayload = {
    _id?: string;
    message?: string;
    receiver_id: string;
    sender_id: string;
    media?: ChatMediaMeta[]; 
    timestamp?: number;
}

export type WSMessage = {
    type: string;
    payload: ChatMessagePayload | Record<string, any>;
}

// https://open.spotify.com/intl-id/track/6RcsAN8XF5KX6mMh6dum8e?si=53bd956200ee4f9b
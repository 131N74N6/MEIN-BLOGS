export type ViewerMessage = {
    viewerMessage: string | null;
    setViewerMessage: (viewerMessage: string | null) => void;
}

export type ViewerUnion = ViewerMessage;
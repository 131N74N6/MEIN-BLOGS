export type ViewerMessage = {
    viewerMessage: string | null;
    setViewerMessage: (viewerMessage: string | null) => void;
}

export type ViewerUnion = ViewerMessage;

export type ViewerDetail = {
    _id: string;
    blog_id: string;
    created_at: Date;
    profile_picture: string | null;
    user_id: string;
    username: string;
}
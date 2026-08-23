export type BlogInfoState = {
    blogIdToggle: (blogIdParam: string) => void;

    chosenBlogsIds: string[];
    resetChosenBlogsIds: () => void;

    content: string;
    setContent: (content: string) => void;

    media: File | null;
    setMedia: (media: File | null) => void;

    mediaUrl: string | null;
    setMediaUrl: (mediaUrl: string | null) => void;

    language: string;
    setLanguage: (language: string) => void;

    resetBlogInfoState: () => void;

    selectMode: boolean;
    setSelectMode: (selectMode: boolean) => void;

    title: string;
    setTitle: (title: string) => void;
}

export type BlogWindowState = {
    blogId: string;
    setBlogId: (blogId: string) => void;
    resetBlogWindowState: () => void;
}

export type BlogMessageState = {
    blogMessage: string | null;
    setBlogMessage: (blogMessage: string | null) => void;
}
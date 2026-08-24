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
    blogId: string | undefined;
    setBlogId: (blogId: string | undefined) => void;

    blogOwnerId: string | undefined;
    setBlogOwnerId: (blogId: string | undefined) => void;

    resetBlogWindowState: () => void;
}

export type BlogMessageState = {
    blogMessage: string | null;
    setBlogMessage: (blogMessage: string | null) => void;
}

export type BlogDetail = {
    _id: string;
    blog_owner_id: string;
    blog_owner_profile_picture: string | null;
    blog_owner_name: string;
    created_at: Date;
    content: string;
    language: string;
    title: string;
    media: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    };
    updated_at: Date;
}
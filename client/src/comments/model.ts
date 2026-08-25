export type CommenInputState = {
    text: string;
    setText: (text: string) => void;

    resetCommentState: () => void;
}

export type CommentMessageState = {
    commentMessage: string | null;
    setCommentMessage: (commentMessage: string | null) => void;
}

export type Union = CommenInputState & CommentMessageState;

export type CommentDetail = {
    _id: string;
    blog_id: string;
    blog_owner_id: string;
    created_at: Date;
    profile_picture: string | null;
    text: string;
    user_id: string;
    username: string;
};
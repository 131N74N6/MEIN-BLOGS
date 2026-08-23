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
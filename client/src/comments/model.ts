import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";

export type CommenInputState = {
    text: string;
    setText: (text: string) => void;

    resetCommentState: () => void;
}

export type Union = CommenInputState;

export type CommentDetail = {
    _id: string;
    created_at: Date;
    isProcessing: boolean;
    profile_picture: string | null;
    text: string;
    user_id: string;
    username: string;
};

export type CommentListDetail = {
    data: CommentDetail[];
    fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<CommentDetail[], unknown>, Error>>;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isProcessing: boolean;
}
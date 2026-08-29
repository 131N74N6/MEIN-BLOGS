import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult, UseMutationResult } from "@tanstack/react-query";
import type { ApiResponse } from "../handler/api";

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

    searched: string;
    setSearched: (searched: string) => void;

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

export type BlogRowData = {
    data: Pick<BlogDetail, "_id" | "blog_owner_id" | "title" | "created_at" | "language">;
    is_processing: boolean;
    see_one_blog_mt: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>;
}

export type BlogTableData = {
    data: Pick<BlogDetail, "_id" | "blog_owner_id" | "title" | "created_at" | "language">[];
    fetch_next_page: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>
    has_next_page: boolean;
    is_fetching_next_page: boolean;
    is_processing: boolean;
    see_one_blog_mt: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>
}

export type BlogCardData = {
    data: Omit<BlogDetail, "updated_at">;
    seeOneBlogMt: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>;
}

export type BlogGridData = {
    data: Omit<BlogDetail, "updated_at">[];
    fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<BlogDetail[], unknown>, Error>>;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isProcessing: boolean;
    seeOneBlogMt: UseMutationResult<ApiResponse<unknown>, Error, void, unknown>;
}
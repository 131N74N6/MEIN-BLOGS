import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult, UseMutationResult } from "@tanstack/react-query";

export interface BlogIntrf {
    _id: string;
    blog_owner_id: string;
    blog_owner_profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
    blog_owner_name: string;
    created_at: string;
    content: string;
    language: string;
    media: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
    title: string;
}

export interface BlogTableRowIntrf {
    blogs: Pick<BlogIntrf, "_id" | "title" | "created_at">[];
    fetch_next_page: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<any, unknown>, Error>>;
    has_next_page: boolean;
    is_processing: boolean;
    is_fetching_next_page: boolean;
    on_delete: UseMutationResult<any, Error, string, unknown>;
}

export interface BlogTableDataIntrf {
    blog: Pick<BlogIntrf, "_id" | "title" | "created_at">;
    is_processing: boolean;
    on_delete: UseMutationResult<any, Error, string, unknown>;
}
import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";

export type RelationState = {
    searchUser: string;
    setSearchUser: (searchUser: string) => void;
    
    resetRelationState: () => void;
}

export type RelationDetail = {
    _id: string;
    created_at: Date;
    profile_picture: string | null;
    user_id: string;
    username: string;
    is_processing: boolean;
};

export type RelationListData = {
    data: RelationDetail[];
    fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<RelationDetail[], unknown>, Error>>
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isProcessing: boolean;
}
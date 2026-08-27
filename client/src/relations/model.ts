import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";
import type { CommentDetail } from "../comments/model";

export type RelationshipState = {
    otherUserId: string;
    setOtherUserId: (otherUserId: string) => void;

    resetRelationShipState: () => void;
}

export type RelationDetail = {
    _id: string;
    created_at: Date;
    profile_picture: string | null;
    user_id: string;
    username: string;
};

export type RelationListData = {
    data: RelationDetail;
    fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<CommentDetail[], unknown>, Error>>;
    has_next_page: boolean;
    is_fetching_next_page: boolean;
    is_processing: boolean;
}
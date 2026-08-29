import type { FetchNextPageOptions, InfiniteData, InfiniteQueryObserverResult } from "@tanstack/react-query";

export type ViewerMessage = {
    viewerMessage: string | null;
    setViewerMessage: (viewerMessage: string | null) => void;
}

export type ViewerUnion = ViewerMessage;

export type ViewerDetail = {
    _id: string;
    created_at: Date;
    is_processing: boolean;
    profile_picture: string | null;
    user_id: string;
    username: string;
}

export type ViewerListData = {
    data: ViewerDetail[];
    fetch_next_page: (options?: FetchNextPageOptions | undefined) => Promise<InfiniteQueryObserverResult<InfiniteData<ViewerDetail[], unknown>, Error>>;
    has_next_page: boolean;
    is_fetching_next_page: boolean;
    is_processing: boolean;
}
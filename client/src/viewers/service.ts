import { useBlogStore } from "../blogs/store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "../api";
import { useStyleStore } from "../styles/store";
import type { ViewerDetail } from "./model";
import { useUserStore } from "../users/store";

export default function useViewerService() {
    const queryClient = useQueryClient();

    const blogId = useBlogStore((state) => state.blogId);
    const blogOwnerId = useBlogStore((state) => state.blogOwnerId);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    const setMessage = useStyleStore((state) => state.setMessage);

    const getAllBlogViewers = useInfiniteQuery({
        enabled: !!blogId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const request = await apiRequest<ViewerDetail[]>(`/api/viewers/show/${blogId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });

            return request.data ?? [];
        },
        queryKey: [`blog-viewers-${blogId}`]
    });

    const getAllBlogViewersTotal = useQuery({
        enabled: !!blogId,
        queryFn: async () => {
            const request = await apiRequest<number>(`/api/viewers/show/total/${blogId}`, { method: "GET" });
            return request.data ?? 0;
        },
        queryKey: [`blog-viewers-total-${blogId}`]
    });

    const getTotalViewerForCurrentUser = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            const endpoint = `/api/viewers/users/show/total/${currentUserId}`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });
            return request.data ?? 0;
        },
        queryKey: [`current-user-viewers-total-${currentUserId}`]
    });

    const getTotalViewerForVisitedUser = useQuery({
        enabled: !!otherUserId && currentUserId !== otherUserId,
        queryFn: async () => {
            const endpoint = `/api/viewers/users/show/total/${otherUserId}`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });
            return request.data ?? 0;
        },
        queryKey: [`visited-user-viewers-total-${otherUserId}`]
    });

    const seeOneBlogMt = useMutation({
        mutationFn: async () => {
            const endpoint = `/api/viewers/start-see`;
            const viewerData = JSON.stringify({ blog_id: blogId, blog_owner_id: blogOwnerId });
            return await apiRequest(endpoint, { body: viewerData, method: "POST" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`blog-viewers-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-viewers-total-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: [`current-user-viewers-total-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`visited-user-viewers-total-${currentUserId}`] })
        }
    });

    const isProcessing = seeOneBlogMt.isPending;

    return {
        getAllBlogViewers, getTotalViewerForCurrentUser, getTotalViewerForVisitedUser, getAllBlogViewersTotal, 
        isProcessing, seeOneBlogMt
    }
}
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../users/store";
import { apiRequest } from "../handler/api";
import { useStyleStore } from "../styles/store";
import type { RelationDetail } from "./model";

export default function useRelationService() {
    const queryClient = useQueryClient();
    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    const getAllFollowed = useInfiniteQuery({
        enabled: !! currentUserId || !!otherUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const endpoint = otherUserId ? 
            `/api/relations/followed/${otherUserId}?page=${pageParam}&limit=${16}` :
            `/api/relations/followed/${currentUserId}?page=${pageParam}&limit=${16}`;

            const request = await apiRequest<RelationDetail[]>(endpoint, { method: "GET" });
            
            return request.data ?? [];
        },
        queryKey: otherUserId ? [`followed-${otherUserId}`] : [`followed-${currentUserId}`]
    });

    const getAllFollowers = useInfiniteQuery({
        enabled: !!currentUserId || !!otherUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const endpoint = otherUserId ? 
            `/api/relations/followers/${otherUserId}?page=${pageParam}&limit=${16}` :
            `/api/relations/followers/${currentUserId}?page=${pageParam}&limit=${16}`;

            const request = await apiRequest<RelationDetail[]>(endpoint, { method: "GET" });
            
            return request.data ?? [];
        },
        queryKey: otherUserId ? [`followers-${otherUserId}`] : [`followers-${currentUserId}`]
    });

    const getAllFollowedTotal = useQuery({
        enabled: !!currentUserId || !!otherUserId,
        queryFn: async () => {
            const endpoint = otherUserId ? 
            `/api/relations/followed/${otherUserId}/total` :
            `/api/relations/followed/${currentUserId}/total`;

            const request = await apiRequest<number>(endpoint, { method: "GET" });

            return request.data ?? 0;
        },
        queryKey: otherUserId ? [`followed-total-${otherUserId}`] : [`followed-total-${currentUserId}`]
    });

    const getAllFollowersTotal = useQuery({
        enabled: !!currentUserId || !!otherUserId,
        queryFn: async () => {
            const endpoint = otherUserId ? 
            `/api/relations/followers/${otherUserId}/total` :
            `/api/relations/followers/${currentUserId}/total`;

            const request = await apiRequest<number>(endpoint, { method: "GET" });
            
            return request.data ?? 0;
        },
        queryKey: otherUserId ? [`followers-total-${otherUserId}`] : [`followers-total-${currentUserId}`]
    });

    const hasUserFollowed = useQuery({
        enabled: !!currentUserId && !!otherUserId,
        queryFn: async () => {
            const endpoint = `/api/relations/has-followed/${currentUserId}/${otherUserId}`;
            const request = await apiRequest<boolean>(endpoint, { method: "GET" });
            
            return request.data ?? false;
        },
        queryKey: [`has-followed-${currentUserId}-${otherUserId}`]
    });

    const startFollowOneUserMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/relations/follow/${otherUserId}`, { method: "POST" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`followed-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`followed-total-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-${otherUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-total-${otherUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`has-followed-${currentUserId}-${otherUserId}`] });
        }
    });

    const unfollowOneUserMt = useMutation({
        mutationFn: async (followed_user_id: string) => {
            return await apiRequest(`/api/relations/${followed_user_id}`, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`followed-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`followed-total-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-${otherUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-total-${otherUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`has-followed-${currentUserId}-${otherUserId}`] });
        },
    });

    const isProcessing = startFollowOneUserMt.isPending || unfollowOneUserMt.isPending;

    return {
        getAllFollowers, getAllFollowed, getAllFollowedTotal, getAllFollowersTotal, 
        hasUserFollowed, isProcessing, startFollowOneUserMt, unfollowOneUserMt
    }
}
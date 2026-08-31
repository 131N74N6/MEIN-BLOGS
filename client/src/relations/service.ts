import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../users/store";
import { apiRequest } from "../handler/api";
import { useStyleStore } from "../styles/store";
import type { RelationDetail } from "./model";
import { useRelationStore } from "./store";
import { useDebounce } from "../blogs/hooks";

export default function useRelationService() {
    const queryClient = useQueryClient();
    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    const searchUser = useRelationStore((state) => state.searchUser);
    const searcedhUser = useDebounce<string>(searchUser.trim(), 500);

    const getAllYourFollowed = useInfiniteQuery({
        enabled: !!currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const endpoint = searcedhUser ? 
            `/api/relations/followed/${currentUserId}?page=${pageParam}&limit=${16}&username=${searcedhUser}` : 
            `/api/relations/followed/${currentUserId}?page=${pageParam}&limit=${16}`;

            const request = await apiRequest<RelationDetail[]>(endpoint, { method: "GET" });
            return request.data ?? [];
        },
        queryKey: searcedhUser ? [`followed-${currentUserId}-${searcedhUser}`] : [`followed-${currentUserId}`]
    });

    const getAllOtherFollowed = useInfiniteQuery({
        enabled: !!otherUserId && otherUserId !== currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const endpoint = `/api/relations/followed/${otherUserId}?page=${pageParam}&limit=${16}`;
            const request = await apiRequest<RelationDetail[]>(endpoint, { method: "GET" });

            return request.data ?? [];
        },
        queryKey: [`followed-${otherUserId}`]
    });

    const getAllYourFollowers = useInfiniteQuery({
        enabled: !!currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const endpoint = searcedhUser ? 
            `/api/relations/followers/${currentUserId}?page=${pageParam}&limit=${16}&username=${searcedhUser}` : 
            `/api/relations/followers/${currentUserId}?page=${pageParam}&limit=${16}`;

            const request = await apiRequest<RelationDetail[]>(endpoint, { method: "GET" });
            return request.data ?? [];
        },
        queryKey: searcedhUser ? [`followers-${currentUserId}-${searcedhUser}`] : [`followers-${currentUserId}`]
    });

    const getAllOtherFollowers = useInfiniteQuery({
        enabled: !!otherUserId && otherUserId !== currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const endpoint = `/api/relations/followers/${otherUserId}?page=${pageParam}&limit=${16}`;

            const request = await apiRequest<RelationDetail[]>(endpoint, { method: "GET" });
            return request.data ?? [];
        },
        queryKey: [`followers-${otherUserId}`]
    });

    const getAllYourFollowedTotal = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            const endpoint = `/api/relations/followed/${currentUserId}/total`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });

            return request.data ?? 0;
        },
        queryKey: [`followed-total-${currentUserId}`]
    });

    const getAllOtherFollowedTotal = useQuery({
        enabled: !!otherUserId && currentUserId !== otherUserId,
        queryFn: async () => {
            const endpoint = `/api/relations/followed/${otherUserId}/total`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });

            return request.data ?? 0;
        },
        queryKey: [`followed-total-${otherUserId}`]
    });

    const getAllYourFollowersTotal = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            const endpoint = `/api/relations/followers/${currentUserId}/total`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });
            
            return request.data ?? 0;
        },
        queryKey: [`followers-total-${currentUserId}`]
    });

    const getAllOtherFollowersTotal = useQuery({
        enabled: !!otherUserId && currentUserId !== otherUserId,
        queryFn: async () => {
            const endpoint = `/api/relations/followers/${otherUserId}/total`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });
            
            return request.data ?? 0;
        },
        queryKey: [`followers-total-${otherUserId}`]
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
            queryClient.invalidateQueries({ queryKey: [`followed-${currentUserId}-${searcedhUser}`] });
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
            queryClient.invalidateQueries({ queryKey: [`followed-${currentUserId}-${searcedhUser}`] });
            queryClient.invalidateQueries({ queryKey: [`followed-total-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-${otherUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`followers-total-${otherUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`has-followed-${currentUserId}-${otherUserId}`] });
        },
    });

    const isProcessing = startFollowOneUserMt.isPending || unfollowOneUserMt.isPending;

    return {
        getAllOtherFollowed,
        getAllOtherFollowedTotal,
        getAllOtherFollowers,
        getAllOtherFollowersTotal,
        getAllYourFollowers, 
        getAllYourFollowed, 
        getAllYourFollowedTotal, 
        getAllYourFollowersTotal, 
        hasUserFollowed, 
        isProcessing, 
        startFollowOneUserMt, 
        unfollowOneUserMt
    }
}
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRelationStore } from "./store";
import { useUserStore } from "../users/store";
import { apiRequest } from "../handler/api";
import { useStyleStore } from "../styles/store";
import type { ViewerDetail } from "./model";

export default function useRelationshipService() {
    const queryClient = useQueryClient();

    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);

    const otherUserId = useRelationStore((state) => state.otherUserId);

    const getAllFollowed = useInfiniteQuery({
        enabled: !!otherUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const request = await apiRequest<ViewerDetail[]>(`/api/relations/followed/${otherUserId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
            
            return request.data ?? [];
        },
        queryKey: [`followed-${otherUserId}`]
    });

    const getAllFollowedTotal = useQuery({
        enabled: !!otherUserId,
        queryFn: async () => {
            const request = await apiRequest<number>(`/api/relations/followed/${otherUserId}/total`, {
                method: "GET"
            });

            return request.data ?? 0;
        },
        queryKey: [`followed-total-${otherUserId}`]
    });

    const getAllFollowers = useInfiniteQuery({
        enabled: !!otherUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const request = await apiRequest<ViewerDetail[]>(`/api/relations/followers/${otherUserId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
            
            return request.data ?? [];
        },
        queryKey: [`followers-${otherUserId}`]
    });

    const getAllFollowersTotal = useQuery({
        enabled: !!otherUserId,
        queryFn: async () => {
            return await apiRequest(`/api/relations/followers/${otherUserId}/total`, {
                method: "GET"
            });
        },
        queryKey: [`followers-total-${otherUserId}`]
    });

    
    const getAllCurrentUserFollowed = useInfiniteQuery({
        enabled: !!currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const request = await apiRequest<ViewerDetail[]>(`/api/relations/followed/${currentUserId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
            
            return request.data ?? [];
        },
        queryKey: [`followed-${currentUserId}`]
    });

    const getAllCurrentUserFollowedTotal = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            return await apiRequest(`/api/relations/followed/${currentUserId}/total`, {
                method: "GET"
            });
        },
        queryKey: [`followed-total-${currentUserId}`]
    });

    const getAllCurrentUserFollowers = useInfiniteQuery({
        enabled: !!currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const request = await apiRequest<ViewerDetail[]>(`/api/relations/followers/${currentUserId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
            
            return request.data ?? [];
        },
        queryKey: [`followers-${currentUserId}`]
    });

    const getAllCurrentUserFollowersTotal = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            return await apiRequest(`/api/relations/followers/${currentUserId}/total`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                method: "GET"
            });
        },
        queryKey: [`followers-total-${currentUserId}`]
    });

    const hasUserFollowed = useQuery({
        enabled: !!currentUserId && !!otherUserId,
        queryFn: async () => {
            return await apiRequest(`/api/relations/has-followed/${currentUserId}/${otherUserId}`, {
                method: "GET"
            });
        },
        queryKey: [`has-followed-${currentUserId}-${otherUserId}`]
    });

    const startFollowOneUserMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/relations/${otherUserId}`, {
                method: "POST"
            });
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
            return await apiRequest(`/api/relations/${followed_user_id}`, {
                method: "DELETE"
            });
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

    const relationProcess = startFollowOneUserMt.isPending || unfollowOneUserMt.isPending;

    return {
        getAllFollowers, getAllCurrentUserFollowed, getAllCurrentUserFollowedTotal, getAllFollowersTotal, 
        getAllCurrentUserFollowers, getAllCurrentUserFollowersTotal, getAllFollowed, getAllFollowedTotal, 
        hasUserFollowed, relationProcess, startFollowOneUserMt, unfollowOneUserMt
    }
}
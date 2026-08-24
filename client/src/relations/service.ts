import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRelationStore } from "./store";
import { useUserStore } from "../users/store";
import { apiRequest } from "../handler/api";
import { useStyleStore } from "../styles/store";

export default function useRelationshipService() {
    const queryClient = useQueryClient();
    const baseUrl = `${import.meta.env.VITE_BASE_API_URL}/relationps`;

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
            return await apiRequest(`${baseUrl}/followed/${otherUserId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
        },
        queryKey: [`followed-${otherUserId}`]
    });

    const getAllFollowedTotal = useQuery({
        enabled: !!otherUserId,
        queryFn: async () => {
            return await apiRequest(`${baseUrl}/followed/${otherUserId}/total`, {
                method: "GET"
            });
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
            return await apiRequest(`${baseUrl}/followers/${otherUserId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
        },
        queryKey: [`followers-${otherUserId}`]
    });

    const getAllFollowersTotal = useQuery({
        enabled: !!otherUserId,
        queryFn: async () => {
            return await apiRequest(`${baseUrl}/followers/${otherUserId}/total`, {
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
            return await apiRequest(`${baseUrl}/followed/${currentUserId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
        },
        queryKey: [`followed-${currentUserId}`]
    });

    const getAllCurrentUserFollowedTotal = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            return await apiRequest(`${baseUrl}/followed/${currentUserId}/total`, {
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
            return await apiRequest(`${baseUrl}/followers/${currentUserId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
        },
        queryKey: [`followers-${currentUserId}`]
    });

    const getAllCurrentUserFollowersTotal = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            return await apiRequest(`${baseUrl}/followers/${currentUserId}/total`, {
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
            return await apiRequest(`${baseUrl}/has-followed/${currentUserId}/${otherUserId}`, {
                method: "GET"
            });
        },
        queryKey: [`has-followed-${currentUserId}-${otherUserId}`]
    });

    const startFollowOneUserMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`${baseUrl}/${otherUserId}`, {
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
            return await apiRequest(`${baseUrl}/${followed_user_id}`, {
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
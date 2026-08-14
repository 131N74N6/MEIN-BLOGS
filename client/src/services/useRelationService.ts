import { useMessageStore } from "@/stores/useMessageStore";
import { useReltionshipStore } from "@/stores/useReltionshipStore";
import { useUserStore } from "@/stores/useUserStore";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useViewerService() {
    const queryClient = useQueryClient();
    const baseUrl = `${import.meta.env.VITE_BASE_API_URL}/relationships`;

    const setMessage = useMessageStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);

    const otherUserId = useReltionshipStore((state) => state.otherUserId);

    const getAllFollowed = useInfiniteQuery({
        enabled: !!otherUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            try {
                const request = await fetch(`${baseUrl}/followed?page=${pageParam}&limit=${16}`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "GET"
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
        },
        queryKey: [`followed-${otherUserId}`]
    });

    const getAllFollowedTotal = useQuery<number>({
        enabled: !!otherUserId,
        queryFn: async () => {
            try {
                const request = await fetch(`${baseUrl}/followed/total`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "GET"
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
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
            try {
                const request = await fetch(`${baseUrl}/followers?page=${pageParam}&limit=${16}`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "GET"
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
        },
        queryKey: [`followers-${otherUserId}`]
    });

    const getAllFollowersTotal = useQuery<number>({
        enabled: !!otherUserId,
        queryFn: async () => {
            try {
                const request = await fetch(`${baseUrl}/followers/total`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "GET"
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
        },
        queryKey: [`followers-total-${otherUserId}`]
    });

    const hasUserFollowed = useQuery<boolean>({
        enabled: !!currentUserId && !!otherUserId,
        queryFn: async () => {
            try {
                const request = await fetch(`${baseUrl}/has-followed/${otherUserId}`, {});

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
        },
        queryKey: [`has-followed-${currentUserId}-${otherUserId}`]
    });

    const startFollowOneUserMt = useMutation({
        mutationFn: async () => {
            try {
                const request = await fetch(`${baseUrl}/follow/${otherUserId}`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "POST"
                });
                
                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
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

    const stopFollowAllUserMt = useMutation({
        mutationFn: async () => {
            try {
                const request = await fetch(`${baseUrl}/unfollow-all`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "DELETE"
                });
                
                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
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

    const stopFollowOneUserMt = useMutation({
        mutationFn: async (followed_user_id: string) => {
            try {
                const request = await fetch(`${baseUrl}/unfollow-one/${followed_user_id}`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "DELETE"
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response
            } catch (error) {
                throw error;
            }
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

    const relationProcess = startFollowOneUserMt.isPending || stopFollowAllUserMt.isPending || 
    stopFollowOneUserMt.isPending;

    return {
        getAllFollowers, getAllFollowersTotal, getAllFollowed, getAllFollowedTotal, hasUserFollowed, 
        relationProcess, startFollowOneUserMt, stopFollowAllUserMt, stopFollowOneUserMt
    }
}
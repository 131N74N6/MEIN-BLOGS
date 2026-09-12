import { useBlogStore } from "../blogs/store";
import { apiRequest } from "../api";
import { useStyleStore } from "../styles/store";
import type { CommentDetail } from "./model";
import { useCommentStore } from "./store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../users/store";

export default function useCommentSevice() {
    const queryClient = useQueryClient();

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    const blogId = useBlogStore((state) => state.blogId);
    const blogOwnerId = useBlogStore((state) => state.blogOwnerId);

    const commentText = useCommentStore((state) => state.text);
    const setCommentText = useCommentStore((state) => state.setText);

    const setMessage = useStyleStore((state) => state.setMessage);

    const createNewCommentMt = useMutation({
        mutationFn: async () => {
            const newComment = { blog_owner_id: blogOwnerId, text: commentText.trim() };

            return await apiRequest(`/api/comments/create/${blogId}`, {
                body: JSON.stringify(newComment),
                method: "POST"
            });
        },
        onError: (error) => {
            console.error(error);
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-comments-total-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: [`current-user-comment-total-received-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`visited-user-comment-total-received-${currentUserId}`] });
            setCommentText("");
        }
    });

    const getAllCommentsInABlog = useInfiniteQuery({
        enabled: !!blogId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryKey: [`blog-comments-${blogId}`],
        queryFn: async ({ pageParam = 1}: { pageParam?: number}) => {
            const request = await apiRequest<CommentDetail[]>(`/api/comments/show/${blogId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });

            return request.data ?? [];
        }
    });

    const getTotalCommentInABlog = useQuery({
        enabled: !!blogId,
        queryKey: [`blog-comments-total-${blogId}`],
        queryFn: async () => {
            const endpoint = `/api/comments/show/total/${blogId}`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });
            return request.data ?? 0;
        },
        staleTime: Infinity
    });

    const getTotalCommentForCurrentUser = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            const endpoint = `/api/comments/users/show/total/${currentUserId}`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });
            return request.data ?? 0;
        },
        queryKey: [`current-user-comment-total-received-${currentUserId}`]
    });

    const getTotalCommentForVisitedUser = useQuery({
        enabled: !!otherUserId && currentUserId !== otherUserId,
        queryFn: async () => {
            const endpoint = `/api/comments/users/show/total/${otherUserId}`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });
            return request.data ?? 0;
        },
        queryKey: [`visited-user-comment-total-received-${otherUserId}`]
    });

    const isProcessing = createNewCommentMt.isPending;

    return {
        createNewCommentMt,
        getAllCommentsInABlog,
        getTotalCommentInABlog,
        getTotalCommentForCurrentUser,
        getTotalCommentForVisitedUser,
        isProcessing
    }
}
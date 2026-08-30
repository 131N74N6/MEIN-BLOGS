import { useBlogStore } from "../blogs/store";
import { apiRequest } from "../handler/api";
import { useStyleStore } from "../styles/store";
import type { CommentDetail } from "./model";
import { useCommentStore } from "./store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useCommentSevice() {
    const queryClient = useQueryClient();
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
            const request = await apiRequest<number>(`/api/comments/show/total/${blogId}`, {
                method: "GET"
            });

            return request.data ?? 0;
        },
        staleTime: Infinity
    });

    const isProcessing = createNewCommentMt.isPending;

    return {
        createNewCommentMt,
        getAllCommentsInABlog,
        getTotalCommentInABlog,
        isProcessing,
    }
}
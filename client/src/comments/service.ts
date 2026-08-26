import { useBlogStore } from "../blogs/store";
import { apiRequest } from "../handler/api";
import type { CommentDetail } from "./model";
import { useCommentStore } from "./store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useCommentSevice() {
    const queryClient = useQueryClient();
    const blogId = useBlogStore((state) => state.blogId);
    const blogOwnerId = useBlogStore((state) => state.blogOwnerId);

    const commentText = useCommentStore((state) => state.text);
    const setCommentMessage = useCommentStore((state) => state.setCommentMessage);

    const createNewCommentMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/comments/${blogId}`, {
                body: JSON.stringify({
                    blog_id: blogId,
                    blog_owner_id: blogOwnerId,
                    text: commentText.trim()
                }),
                method: "POST"
            });
        },
        onError: (error) => {
            setCommentMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-comments-total-${blogId}`] });
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
            const request = await apiRequest<CommentDetail[]>(`/api/comments/${blogId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });

            return request.data ?? [];
        },
        staleTime: Infinity
    });

    const getTotalCommentInABlog = useQuery({
        enabled: !!blogId,
        queryKey: [`blog-comments-total-${blogId}`],
        queryFn: async () => {
            const request = await apiRequest<number>(`/api/comments/${blogId}/total`, {
                method: "GET"
            });

            return request.data ?? 0;
        },
        staleTime: Infinity
    });

    const commentProcessing = createNewCommentMt.isPending;

    return {
        createNewCommentMt,
        commentProcessing,
        getAllCommentsInABlog,
        getTotalCommentInABlog
    }
}
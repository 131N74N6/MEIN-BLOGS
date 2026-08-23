import { useBlogStore } from "../blogs/store";
import { useCommentStore } from "./store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useCommentSevice() {
    const queryClient = useQueryClient();
    const blogId = useBlogStore((state) => state.blogId);

    const commentText = useCommentStore((state) => state.text);
    const setCommentMessage = useCommentStore((state) => state.setCommentMessage);

    const createNewCommentMt = useMutation({
        mutationFn: async () => {
            try {
                const blogCommentForm = new FormData();
                blogCommentForm.append("blog_id", blogId);
                blogCommentForm.append("text", commentText);

                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/comments/make/${blogId}`, {
                    body: blogCommentForm,
                    credentials: "include",
                    method: "POST"
                });

                const response = await request.json();
                return response;
            } catch (error) {
                throw error;
            }
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
            try {
                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/comments/show-all/${blogId}?page=${pageParam}&limit=${16}`, {
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
        staleTime: Infinity
    });

    const getTotalCommentInABlog = useQuery({
        enabled: !!blogId,
        queryKey: [`blog-comments-total-${blogId}`],
        queryFn: async () => {
            try {
                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/comments/total/${blogId}`, {
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
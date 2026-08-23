import { useBlogStore } from "../blogs/store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useViewerStore } from "./store";

export default function useViewerService() {
    const baseUrl = `${import.meta.env.VITE_BASE_API_URL}/viewers`;
    const queryClient = useQueryClient();

    const blogId = useBlogStore((state) => state.blogId);

    const setViewerMessage = useViewerStore((state) => state.setViewerMessage);

    const getAllBlogViewers = useInfiniteQuery({
        enabled: !!blogId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            try {
                const request = await fetch(`${baseUrl}/show-all/${blogId}?page=${pageParam}&limit=${16}`, {
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
        queryKey: [`blog-viewers-${blogId}`]
    });

    const getAllBlogViewersTotal = useQuery<number>({
        enabled: !!blogId,
        queryFn: async () => {
            try {
                const request = await fetch(`${baseUrl}/total/${blogId}`, {
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
        queryKey: [`blog-viewers-total-${blogId}`]
    });

    const seeOneBlogMt = useMutation({
        mutationFn: async () => {
            try {
                const request = await fetch(`${baseUrl}/blog/${blogId}`, {
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
            setViewerMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`blog-viewers-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-viewers-total-${blogId}`] });
        }
    });

    return {
        getAllBlogViewers, getAllBlogViewersTotal, seeOneBlogMt
    }
}
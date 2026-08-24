import { useBlogStore } from "../blogs/store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useViewerStore } from "./store";
import { apiRequest } from "../handler/api";

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
            return await apiRequest(`${baseUrl}/${blogId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });
        },
        queryKey: [`blog-viewers-${blogId}`]
    });

    const getAllBlogViewersTotal = useQuery({
        enabled: !!blogId,
        queryFn: async () => {
            return await apiRequest(`${baseUrl}/${blogId}/total`, {
                method: "GET"
            });
        },
        queryKey: [`blog-viewers-total-${blogId}`]
    });

    const seeOneBlogMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`${baseUrl}/${blogId}`, {
                method: "POST"
            });
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
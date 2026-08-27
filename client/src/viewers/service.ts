import { useBlogStore } from "../blogs/store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiRequest } from "../handler/api";
import { useStyleStore } from "../styles/store";
import type { ViewerDetail } from "./model";

export default function useViewerService() {
    const queryClient = useQueryClient();
    const blogId = useBlogStore((state) => state.blogId);
    const setMessage = useStyleStore((state) => state.setMessage);

    const getAllBlogViewers = useInfiniteQuery({
        enabled: !!blogId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam: number }) => {
            const request = await apiRequest<ViewerDetail[]>(`/api/viewers/${blogId}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });

            return request.data ?? [];
        },
        queryKey: [`blog-viewers-${blogId}`]
    });

    const getAllBlogViewersTotal = useQuery({
        enabled: !!blogId,
        queryFn: async () => {
            const request = await apiRequest<number>(`/api/viewers/${blogId}/total`, {
                method: "GET"
            });

            return request.data ?? 0;
        },
        queryKey: [`blog-viewers-total-${blogId}`]
    });

    const seeOneBlogMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/viewers/${blogId}`, {
                method: "POST"
            });
        },
        onError: (error) => {
            setMessage(error.message);
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
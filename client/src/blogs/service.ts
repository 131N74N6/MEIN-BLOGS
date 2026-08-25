import { useBlogStore } from "./store";
import { useUserStore } from "../users/store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { apiRequest, apiUpload } from "../handler/api";
import type { BlogDetail } from "./model";

export default function useBlogService() {
    const queryClient = useQueryClient();
    const blogMediaRef = useRef<HTMLInputElement>(null);
    const baseUrl = `${import.meta.env.VITE_BASE_API_URL}/blogs/api`;

    const setBlogMessage = useBlogStore((state) => state.setBlogMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);

    const content = useBlogStore((state) => state.content);
    const setContent = useBlogStore((state) => state.setContent);

    const media = useBlogStore((state) => state.media);
    const setMedia = useBlogStore((state) => state.setMedia);

    const setMediaUrl = useBlogStore((state) => state.setMediaUrl);
    
    const language = useBlogStore((state) => state.language);
    const setLanguage = useBlogStore((state) => state.setLanguage);

    const title = useBlogStore((state) => state.title);
    const setTitle = useBlogStore((state) => state.setTitle);
    
    const blogId = useBlogStore((state) => state.blogId);
    const chosenBlogsIds = useBlogStore((state) => state.chosenBlogsIds);

    const blogMediaPrefiew = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setMedia(file);
        const fileUrl = URL.createObjectURL(file as Blob);
        setMediaUrl(fileUrl);

        if (blogMediaRef.current) blogMediaRef.current.value = "";
    }

    const changeOneBlogMt = useMutation({
        mutationFn: async (id: string) => {
            const updateBlogForm = new FormData();
            updateBlogForm.append("content", content);
            updateBlogForm.append("language", language.trim());
            updateBlogForm.append("title", title.trim());
            if (media) updateBlogForm.append("media", media);

            return await apiUpload(`${baseUrl}/${id}`, updateBlogForm, "PUT");
        },
        onError: (error) => {
            setBlogMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-content-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
        }
    });

    const createNewBlogMt = useMutation({
        mutationFn: async () => {
            const newBlogForm = new FormData();
            newBlogForm.append("content", content);
            newBlogForm.append("language", language.trim());
            newBlogForm.append("title", title.trim());
            if (media) newBlogForm.append("media", media);

            return await apiUpload(`${baseUrl}`, newBlogForm, "POST");
        },
        onError: (error) => {
            setBlogMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            setContent("");
            setMedia(null);
            setLanguage("");
            setTitle("");
        }
    });

    const deleteAllCurrentUserBlogsMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`${baseUrl}`, {
                method: "DELETE"
            });
        },
        onError: (error) => {
            setBlogMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
            setContent("");
            setMedia(null);
            setLanguage("");
            setTitle("");
        },
    });

    const deleteChosenCurrentUserBlogMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`${baseUrl}/bulk`, {
                body: JSON.stringify({ blogs_ids: chosenBlogsIds }),
                method: "DELETE"
            });
        },
        onError: (error) => {
            setBlogMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
            setContent("");
            setMedia(null);
            setLanguage("");
            setTitle("");
        },
    });

    const generateNewBlogMt = useMutation({
        mutationFn: async () => {
            const newBlogForm = new FormData();
            newBlogForm.append("language", language);
            newBlogForm.append("title", title);
            if (media) newBlogForm.append("file", media);

            return await apiUpload(`${baseUrl}/generate`, newBlogForm, "POST");
        },
        onError: (error) => {
            setBlogMessage(error.message);
        }
    });

    const getAllBlogs = useInfiniteQuery({
        enabled: !!currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryKey: ["all-blogs"],
        queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
            const request = await apiRequest<BlogDetail[]>(`${baseUrl}?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });

            return request.data ?? [];
        }
    });

    const getAllCurrentUserBlogs = useInfiniteQuery({
        enabled: !!currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryKey: [`user-blogs-${currentUserId}`],
        queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
            const request = await apiRequest<BlogDetail[]>(`${baseUrl}/mine?page=${pageParam}&limit=${16}`, {
                method: "GET"
            });

            return request.data ?? [];
        }
    });

    const getOneBlogContent = useQuery({
        enabled: !!blogId,
        queryKey: [`blog-content-${blogId}`],
        queryFn: async () => {
            const request = await apiRequest<BlogDetail>(`${baseUrl}/show/${blogId}`, {
                method: "GET"
            });

            return request.data ?? {};
        }
    });

    const processing = deleteAllCurrentUserBlogsMt.isPending || deleteChosenCurrentUserBlogMt.isPending ||
    createNewBlogMt.isPending || generateNewBlogMt.isPending || changeOneBlogMt.isPending;

    return {
        blogMediaPrefiew,
        createNewBlogMt,
        deleteAllCurrentUserBlogsMt,
        deleteChosenCurrentUserBlogMt,
        generateNewBlogMt,
        getAllBlogs,
        getAllCurrentUserBlogs,
        getOneBlogContent,
        processing,
        changeOneBlogMt,
    }
}
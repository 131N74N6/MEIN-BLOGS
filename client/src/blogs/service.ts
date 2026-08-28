import { useBlogStore } from "./store";
import { useUserStore } from "../users/store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { apiRequest, apiUpload } from "../handler/api";
import type { BlogDetail } from "./model";
import { useStyleStore } from "../styles/store";
import { useNavigate } from "react-router-dom";

export default function useBlogService() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const blogMediaRef = useRef<HTMLInputElement>(null);

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

    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

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
            updateBlogForm.append("language", language.trim().toLowerCase());
            updateBlogForm.append("title", title.trim());
            updateBlogForm.append("content", content.trim());
            if (media) updateBlogForm.append("media", media);

            return await apiUpload(`/api/blogs/remake/${id}`, updateBlogForm, "PUT");
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-content-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            navigate("/users/blogs");
        }
    });

    const createNewBlogMt = useMutation({
        mutationFn: async () => {
            const newBlogForm = new FormData();
            newBlogForm.append("language", language.trim().toLowerCase());
            newBlogForm.append("title", title.trim());
            newBlogForm.append("content", content.trim());
            if (media) newBlogForm.append("media", media);

            return await apiUpload(`/api/blogs/create`, newBlogForm, "POST");
        },
        onError: (error) => {
            setMessage(error.message);
            console.error("❌ [Frontend Error] Gagal membuat blog:", error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            setContent("");
            setMedia(null);
            setMediaUrl(null);
            setLanguage("");
            setTitle("");
            navigate("/users/blogs");
        }
    });

    const deleteAllCurrentUserBlogsMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/blogs/rm-all`, {
                method: "DELETE"
            });
        },
        onError: (error) => {
            setMessage(error.message);
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
            return await apiRequest(`/api/blogs/rm-chosen`, {
                body: JSON.stringify({ blogs_ids: chosenBlogsIds }),
                method: "DELETE"
            });
        },
        onError: (error) => {
            setMessage(error.message);
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
            const ingredients = JSON.stringify({
                language: language.trim(),
                title: title.trim(),
            });

            return await apiRequest<string>(`/api/blogs/generate`, {
                body: ingredients,
                method: "POST"
            });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: (response) => {
            setContent(response.data!);
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
            const url = `/api/blogs/show-all?page=${pageParam}&limit=${16}`;
            const request = await apiRequest<BlogDetail[]>(url, { method: "GET" });

            return request.data ?? [];
        }
    });

    const getAllCurrentUserBlogs = useInfiniteQuery({
        enabled: !!currentUserId || !!otherUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryKey: otherUserId ? [`user-blogs-${otherUserId}`] : [`user-blogs-${currentUserId}`],
        queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
            const url = otherUserId ? 
            `/api/blogs/user/${otherUserId}?page=${pageParam}&limit=${16}` :
            `/api/blogs/user/${currentUserId}?page=${pageParam}&limit=${16}`;

            const request = await apiRequest<BlogDetail[]>(url, { method: "GET" });
            return request.data ?? [];
        }
    });

    const getOneBlogContent = useQuery({
        enabled: !!blogId,
        queryKey: [`blog-content-${blogId}`],
        queryFn: async () => {
            const request = await apiRequest<BlogDetail>(`/api/blogs/show/${blogId}`, { method: "GET" });
            return request.data ?? {};
        }
    });

    const processing = deleteAllCurrentUserBlogsMt.isPending || deleteChosenCurrentUserBlogMt.isPending ||
    createNewBlogMt.isPending || generateNewBlogMt.isPending || changeOneBlogMt.isPending;

    return {
        blogMediaPrefiew,
        blogMediaRef,
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
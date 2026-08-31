import { useBlogStore } from "./store";
import { useUserStore } from "../users/store";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { apiRequest, apiUpload } from "../handler/api";
import type { BlogDetail } from "./model";
import { useStyleStore } from "../styles/store";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "./hooks";

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

    const searched = useBlogStore((state) => state.searched);
    const titleSearch = useDebounce<string>(searched.trim(), 500);
    
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
            setMessage(error.message || "failed to edit and save blog. try again later");
        },
        onSuccess: () => {
            if (titleSearch !== "") queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}-${titleSearch}`] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-content-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: [`all-blogs-${titleSearch}`] });
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
            setMessage(error.message || "failed to upload blog. try again later");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            queryClient.invalidateQueries({ queryKey: [`all-blogs-${titleSearch}`] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            if (titleSearch !== "") queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}-${titleSearch}`] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-total-${currentUserId}`] });
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
            queryClient.invalidateQueries({ queryKey: [`all-blogs-${titleSearch}`] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            if (titleSearch !== "") queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}-${titleSearch}`] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-total-${currentUserId}`] });
            setContent("");
            setMedia(null);
            setMediaUrl(null);
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
            queryClient.invalidateQueries({ queryKey: [`all-blogs-${titleSearch}`] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            if (titleSearch !== "") queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}-${titleSearch}`] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-total-${currentUserId}`] });
            setContent("");
            setMedia(null);
            setMediaUrl(null);
            setLanguage("");
            setTitle("");
        },
    });

    const generateNewBlogMt = useMutation({
        mutationFn: async () => {
            const ingredients = JSON.stringify({ language: language.trim(), title: title.trim() });

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
        queryKey: titleSearch ? [`all-blogs-${titleSearch}`] : ["all-blogs"],
        queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
            const url = titleSearch ? 
            `/api/blogs/show-all?page=${pageParam}&limit=${16}&title=${titleSearch}` : 
            `/api/blogs/show-all?page=${pageParam}&limit=${16}`;
            
            const request = await apiRequest<BlogDetail[]>(url, { method: "GET" });

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

        queryKey: titleSearch ? [`user-blogs-${currentUserId}-${titleSearch}`] : [`user-blogs-${currentUserId}`],

        queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
            const url = titleSearch ? 
            `/api/blogs/user/${currentUserId}?page=${pageParam}&limit=${16}&title=${titleSearch}` :
            `/api/blogs/user/${currentUserId}?page=${pageParam}&limit=${16}`;

            const request = await apiRequest<BlogDetail[]>(url, { method: "GET" });
            return request.data ?? [];
        }
    });

    const getAllOtherUserBlogs = useInfiniteQuery({
        enabled: !!otherUserId && otherUserId !== currentUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 16) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,

        queryKey: titleSearch ? [`user-blogs-${otherUserId}-${titleSearch}`] : [`user-blogs-${otherUserId}`],

        queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
            const url = titleSearch ? 
            `/api/blogs/user/${otherUserId}?page=${pageParam}&limit=${16}&title=${titleSearch}` :
            `/api/blogs/user/${otherUserId}?page=${pageParam}&limit=${16}`;

            const request = await apiRequest<BlogDetail[]>(url, { method: "GET" });
            return request.data ?? [];
        }
    });

    const getAllCurrentUserBlogsTotal = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            const endpoint = `/api/blogs/user/total/${currentUserId}`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });

            return request.data ?? 0;
        },
        queryKey: [`user-blogs-total-${currentUserId}`]
    });

    const getAllOtherUserBlogsTotal = useQuery({
        enabled: !!otherUserId && otherUserId !== currentUserId,
        queryFn: async () => {
            const endpoint = `/api/blogs/user/total/${otherUserId}`;
            const request = await apiRequest<number>(endpoint, { method: "GET" });
            
            return request.data ?? 0;
        },
        queryKey: [`user-blogs-total-${otherUserId}`]
    });

    const getOneBlogContent = useQuery({
        enabled: !!blogId,
        queryFn: async () => {
            const request = await apiRequest<BlogDetail>(`/api/blogs/show/${blogId}`, { method: "GET" });
            return request.data;
        },
        queryKey: [`blog-content-${blogId}`]
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
        getAllCurrentUserBlogsTotal,
        getAllOtherUserBlogs,
        getAllOtherUserBlogsTotal,
        getOneBlogContent,
        processing,
        changeOneBlogMt,
    }
}
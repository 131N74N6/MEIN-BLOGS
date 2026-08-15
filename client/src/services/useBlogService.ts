import { useBlogStore } from "@/stores/useBlogStore";
import { useMessageStore } from "@/stores/useMessageStore";
import { useUserStore } from "@/stores/useUserStore";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

export default function useBlogService() {
    const baseUrl = `${import.meta.env.VITE_BASE_API_URL}/blogs`;
    const queryClient = useQueryClient();
    const blogMediaRef = useRef<HTMLInputElement>(null);

    const setMessage = useMessageStore((state) => state.setMessage);

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

    const blogMediaPrefiew = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setMedia(file);
        const fileUrl = URL.createObjectURL(file as Blob);
        setMediaUrl(fileUrl);

        if (blogMediaRef.current) blogMediaRef.current.value = "";
    }

    const createNewBlogMt = useMutation({
        mutationFn: async () => {
            try {
                const newBlogForm = new FormData();
                newBlogForm.append("content", content);
                newBlogForm.append("language", language.trim());
                newBlogForm.append("title", title.trim());
                if (media) newBlogForm.append("blog_media", media);

                const request = await fetch(`${baseUrl}/create`, {
                    body: newBlogForm,
                    credentials: "include",
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
            setMessage(error.message);
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
            try {
                const request = await fetch(`${baseUrl}/rm-all`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "DELETE"
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
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

    const deleteOneCurrentUserBlogMt = useMutation({
        mutationFn: async (id: string) => {
            try {
                const request = await fetch(`${baseUrl}/rm/${id}`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "DELETE"
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
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
            try {
                const newBlogForm = new FormData();
                newBlogForm.append("language", language);
                newBlogForm.append("title", title);
                if (media) newBlogForm.append("file", media);

                const request = await fetch(`${baseUrl}/generate`, {
                    body: newBlogForm,
                    credentials: "include",
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
            setMessage(error.message);
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
            try {
                const request = await fetch(`/show-all?page=${pageParam}&limit=${16}`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "GET"
                });

                const response = await request.json();
                return response;
            } catch (error) {
                throw error;
            }
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
            try {
                const request = await fetch(`${baseUrl}/mine/show-all?page=${pageParam}&limit=${16}`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: "GET"
                });

                const response = await request.json();
                return response;
            } catch (error) {
                throw error;
            }
        }
    });

    const getOneBlogContent = useQuery({
        enabled: !!blogId,
        queryKey: [`blog-content-${blogId}`],
        queryFn: async () => {
            try {
                const request = await fetch(`${baseUrl}/show/${blogId}`, {
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
        }
    });

    const updateOneBlogMt = useMutation({
        mutationFn: async (id: string) => {
            try {
                const updateBlogForm = new FormData();
                updateBlogForm.append("content", content);
                updateBlogForm.append("language", language.trim());
                updateBlogForm.append("title", title.trim());
                if (media) updateBlogForm.append("blog_media", media);

                const request = await fetch(`${baseUrl}/remake/${id}`, {
                    body: updateBlogForm,
                    credentials: "include",
                    method: "PUT"
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`blog-content-${blogId}`] });
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
        }
    });

    const processing = deleteAllCurrentUserBlogsMt.isPending || deleteOneCurrentUserBlogMt.isPending ||
    createNewBlogMt.isPending || generateNewBlogMt.isPending || updateOneBlogMt.isPending;

    return {
        blogMediaPrefiew,
        createNewBlogMt,
        deleteAllCurrentUserBlogsMt,
        deleteOneCurrentUserBlogMt,
        generateNewBlogMt,
        getAllBlogs,
        getAllCurrentUserBlogs,
        getOneBlogContent,
        processing,
        updateOneBlogMt,
    }
}

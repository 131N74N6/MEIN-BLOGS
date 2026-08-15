import type { UserIntrf } from "@/models/userModel";
import { useBlogStore } from "@/stores/useBlogStore";
import { useCommentStore } from "@/stores/useCommentStore";
import { useMessageStore } from "@/stores/useMessageStore";
import { useUserStore } from "@/stores/useUserStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useUserService() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const profilePictureRef = useRef<HTMLInputElement>(null);

    const setMessage = useMessageStore((state) => state.setMessage);

    const setCurrentUserId = useUserStore((state) => state.setCurrentUserId);
    
    const email = useUserStore((state) => state.email);
    const setEmail = useUserStore((state) => state.setEmail);

    const newProfilePcture = useUserStore((state) => state.newProfilePcture);
    const setNewProfilePcture = useUserStore((state) => state.setNewProfilePcture);
    const setNewProfilePctureUrl = useUserStore((state) => state.setNewProfilePctureUrl);

    const password = useUserStore((state) => state.password);
    const setPassword = useUserStore((state) => state.setPassword);

    const username = useUserStore((state) => state.username);
    const setUsername = useUserStore((state) => state.setUsername);

    const resetUserInfoState = useUserStore((state) => state.resetUserInfoState);
    const resetUserProfileState = useUserStore((state) => state.resetUserProfileState);
    const resetUserWindowState = useUserStore((state) => state.resetUserWindowState);
    
    const blogId = useBlogStore((state) => state.blogId);

    const resetBlogInfoState = useBlogStore((state) => state.resetBlogInfoState);
    const resetBlogWindowState = useBlogStore((state) => state.resetBlogWindowState);

    const resetCommentState = useCommentStore((state) => state.resetCommentState);

    const getCurrentUser = useQuery<UserIntrf>({
        queryKey: ["current-user"],
        queryFn: async () => {
            try {
                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/show`, {
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    method: 'GET'
                });

                const response = await request.json();
                if (!request.ok) throw new Error(response.message);
                return response;
            } catch (error) {
                throw error;
            }
        },
        retry: false,
        staleTime: Infinity
    });

    useEffect(() => {
        if (getCurrentUser.data && getCurrentUser.data.user_id) {
            setCurrentUserId(getCurrentUser.data.user_id);
        }
    }, [getCurrentUser.data]);

    const deleteUserMt = useMutation({
        mutationFn: async () => {
            try {
                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/rm`, {
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
            queryClient.clear();
            resetBlogInfoState();
            resetBlogWindowState();
            resetCommentState();
            resetUserInfoState();
            resetUserProfileState();
            resetUserWindowState();
            if (profilePictureRef.current) profilePictureRef.current.value = "";
        }
    });

    const handleUserProfilePicture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFile = event.target.files?.[0];
        if (newFile) setNewProfilePcture(newFile);
        const newFileUrl = URL.createObjectURL(newFile as Blob);
        setNewProfilePctureUrl(newFileUrl);
        if (profilePictureRef.current) profilePictureRef.current.value = "";
    }

    const removeOldProfilePictureMt = useMutation({
        mutationFn: async () => {
            try {
                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/rm-picture`, {
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
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
        }
    });
    
    const updateUserMt = useMutation({
        mutationFn: async () => {
            try {
                const changeUserForm = new FormData();
                changeUserForm.append("username", username.trim());
                if (newProfilePcture) changeUserForm.append("profile_picture", newProfilePcture);

                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/remake`, {
                    body: changeUserForm,
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
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
            resetUserProfileState();
            setUsername("");
            if (profilePictureRef.current) profilePictureRef.current.value = "";
        }
    });

    const signInMt = useMutation({
        mutationFn: async () => {
            try {
                const signInForm = new FormData();
                signInForm.append("username", username.trim());
                signInForm.append("password", password.trim());

                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/sign-in`, {
                    body: signInForm,
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
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            setPassword("");
            setUsername("");
        }
    });

    const signOutMt = useMutation({
        mutationFn: async () => {
            try {
                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/sign-out`, {
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
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.clear();
            resetBlogInfoState();
            resetBlogWindowState();
            resetCommentState();
            resetUserInfoState();
            resetUserProfileState();
            resetUserWindowState();
            if (profilePictureRef.current) profilePictureRef.current.value = "";
            navigate("/sign-in");
        }
    });

    const signUpMt = useMutation({
        mutationFn: async () => {
            try {
                const signUpForm = new FormData();
                signUpForm.append("email", email.trim());
                signUpForm.append("password", password.trim());
                signUpForm.append("username", username.trim());

                const request = await fetch(`${import.meta.env.VITE_BASE_API_URL}/users/sign-up`, {
                    body: signUpForm,
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
            setEmail("");
            setPassword("");
            setUsername("");
        }
    });

    const userProcessing = signInMt.isPending || signOutMt.isPending || signUpMt.isPending ||
    deleteUserMt.isPending || removeOldProfilePictureMt.isPending || updateUserMt.isPending;

    return { 
        deleteUserMt, updateUserMt, getCurrentUser, 
        handleUserProfilePicture,
        profilePictureRef, signInMt, signOutMt, signUpMt, userProcessing
    }
}
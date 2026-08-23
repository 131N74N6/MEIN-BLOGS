import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBlogStore } from "../blogs/store";
import { useCommentStore } from "../comments/store";
import { useUserStore } from "./store";
import type { UserIntrf } from "./model";
import { useReltionshipStore } from "../relationships/store";
import { useStyleStore } from "../styles/store";

export default function useUserService() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const profilePictureRef = useRef<HTMLInputElement>(null);

    const setUserMessage = useUserStore((state) => state.setUserMessage);
    const setCurrentUserId = useUserStore((state) => state.setCurrentUserId);

    const newUserName = useUserStore((state) => state.newUserName);
    const setNewUserName = useUserStore((state) => state.setNewUserName);

    const newProfilePcture = useUserStore((state) => state.newProfilePcture);
    const setNewProfilePcture = useUserStore((state) => state.setNewProfilePcture);
    
    const setNewProfilePctureUrl = useUserStore((state) => state.setNewProfilePctureUrl);

    const resetUserProfileState = useUserStore((state) => state.resetUserProfileState);
    const resetUserIdState = useUserStore((state) => state.resetUserIdState);
    
    const blogId = useBlogStore((state) => state.blogId);

    const resetBlogInfoState = useBlogStore((state) => state.resetBlogInfoState);
    const resetBlogWindowState = useBlogStore((state) => state.resetBlogWindowState);

    const resetRelationShipState = useReltionshipStore((state) => state.resetRelationShipState);

    const resetCommentState = useCommentStore((state) => state.resetCommentState);

    const resetNavbarState = useStyleStore((state) => state.resetNavbarState);

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
        retry: false
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
            setUserMessage(error.message);
        },
        onSuccess: () => {
            queryClient.clear();
            if (profilePictureRef.current) profilePictureRef.current.value = "";
            resetBlogInfoState();
            resetBlogWindowState();
            resetCommentState();
            resetRelationShipState();
            resetUserProfileState();
            resetUserIdState();
            resetNavbarState();
            navigate("/sign-in");
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
            setUserMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
        }
    });
    
    const updateUserMt = useMutation({
        mutationFn: async () => {
            try {
                const changeUserForm = new FormData();
                changeUserForm.append("username", newUserName.trim());
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
            setUserMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
            resetUserProfileState();
            setNewUserName("");
            if (profilePictureRef.current) profilePictureRef.current.value = "";
        }
    });

    const isProcessing = deleteUserMt.isPending || removeOldProfilePictureMt.isPending || 
    updateUserMt.isPending;

    return { 
        deleteUserMt, updateUserMt, getCurrentUser, handleUserProfilePicture, profilePictureRef, 
        isProcessing
    }
}
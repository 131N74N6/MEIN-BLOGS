import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBlogStore } from "../blogs/store";
import { useCommentStore } from "../comments/store";
import { useUserStore } from "./store";
import { useStyleStore } from "../styles/store";
import { apiRequest, apiUpload } from "../api";
import type { OtherUserData } from "./model";
import { useRelationStore } from "../relations/store";
import { useUserChatStore } from "../user_chats/store";

export default function useUserService() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const profilePictureRef = useRef<HTMLInputElement>(null);

    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    const newDescription = useUserStore((state) => state.newDescription);
    const setNewDescription = useUserStore((state) => state.setNewDescription);

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

    const resetCommentState = useCommentStore((state) => state.resetCommentState);
    const resetMessageChatState = useUserChatStore((state) => state.resetMessageChatState);
    const resetRelationState = useRelationStore((state) => state.resetRelationState);

    const resetNavbarState = useStyleStore((state) => state.resetNavbarState);
    
    const changeUserMt = useMutation({
        mutationFn: async () => {
            const endpoint = `/api/users/remake`;
            const changeUserForm = new FormData();
            changeUserForm.append("name", newUserName.trim());
            if (newDescription) changeUserForm.append("description", newDescription.trim())
            if (newProfilePcture) changeUserForm.append("image", newProfilePcture);

            return await apiUpload(endpoint, changeUserForm, "PUT");
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            queryClient.invalidateQueries({ queryKey: [`user-blogs-${currentUserId}`] });

            if (profilePictureRef.current) profilePictureRef.current.value = "";

            if (blogId) {
                queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
                queryClient.invalidateQueries({ queryKey: [`blog-viewers-${blogId}`] });
            }
            
            resetUserProfileState();
            setNewUserName("");
            setNewDescription("");
            navigate("/users");
        }
    });

    const deleteUserMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/users/rm`, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            if (profilePictureRef.current) profilePictureRef.current.value = "";
            queryClient.setQueryData(['current-user'], null);
            queryClient.clear();
            resetBlogInfoState();
            resetBlogWindowState();
            resetCommentState();
            resetRelationState();
            resetUserProfileState();
            resetUserIdState();
            resetNavbarState();
            resetMessageChatState();
            useBlogStore.persist.clearStorage();
            useUserStore.persist.clearStorage();
            useUserChatStore.persist.clearStorage();
            navigate("/sign-in");
        }
    });

    const deleteOldProfilePictureMt = useMutation({
        mutationFn: async () => {
            const endpoint = `/api/users/rm/profile-picture`;
            return await apiRequest(endpoint, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-blogs"] });
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            
            if (profilePictureRef.current) profilePictureRef.current.value = "";

            if (blogId) {
                queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
                queryClient.invalidateQueries({ queryKey: [`blog-viewers-${blogId}`] });
            }

            navigate("/users");
        }
    });
    
    const getCurrentUser = useQuery({
        enabled: !!otherUserId && otherUserId !== currentUserId,
        queryFn: async () => {
            const endpoint = `/api/users/show/${otherUserId}`;
            const request = await apiRequest<OtherUserData>(endpoint, { method: "GET" });
            return request.data;
        },
        queryKey: [`other-user-${otherUserId}`]
    });

    const handleUserProfilePicture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFile = event.target.files?.[0];
        if (newFile) setNewProfilePcture(newFile);
        const newFileUrl = URL.createObjectURL(newFile as Blob);
        setNewProfilePctureUrl(newFileUrl);
        if (profilePictureRef.current) profilePictureRef.current.value = "";
    }

    const isProcessing = deleteUserMt.isPending || deleteOldProfilePictureMt.isPending || 
    changeUserMt.isPending;

    return { 
        deleteUserMt, deleteOldProfilePictureMt, getCurrentUser, handleUserProfilePicture, 
        isProcessing, profilePictureRef, changeUserMt
    }
}
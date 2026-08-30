import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useBlogStore } from "../blogs/store";
import { useCommentStore } from "../comments/store";
import { useUserStore } from "./store";
import { useStyleStore } from "../styles/store";
import { apiRequest, apiUpload } from "../handler/api";

export default function useUserService() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const profilePictureRef = useRef<HTMLInputElement>(null);

    const setMessage = useStyleStore((state) => state.setMessage);

    const otherUserId = useUserStore((state) => state.otherUserId);

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

    const resetNavbarState = useStyleStore((state) => state.resetNavbarState);
    
    const changeUserMt = useMutation({
        mutationFn: async () => {
            const changeUserForm = new FormData();
            changeUserForm.append("name", newUserName.trim());
            if (newProfilePcture) changeUserForm.append("image", newProfilePcture);

            return await apiUpload(`/api/users/remake`, changeUserForm, "PUT");
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            queryClient.invalidateQueries({ queryKey: [`blog-comments-${blogId}`] });
            resetUserProfileState();
            setNewUserName("");
            if (profilePictureRef.current) profilePictureRef.current.value = "";
        }
    });

    const deleteUserMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/users/rm`, {
                method: "DELETE"
            });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.setQueryData(['current-user'], null);
            queryClient.clear();
            if (profilePictureRef.current) profilePictureRef.current.value = "";
            resetBlogInfoState();
            resetBlogWindowState();
            resetCommentState();
            resetUserProfileState();
            resetUserIdState();
            resetNavbarState();
            useBlogStore.persist.clearStorage();
            useUserStore.persist.clearStorage();
            navigate("/sign-in");
        }
    });

    const deleteOldProfilePictureMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/users/rm/profile-picture`, {
                method: "DELETE"
            });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
        }
    });
    
    const getCurrentUser = useQuery({
        enabled: !!otherUserId,
        queryKey: [`other-user`],
        queryFn: async () => {
            const request = await apiRequest(`/api/users/show/${otherUserId}`, { method: "GET" });

            return request.data;
        },
        retry: false
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
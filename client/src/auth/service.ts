import { createAuthClient } from "better-auth/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBlogStore } from "../blogs/store";
import { useCommentStore } from "../comments/store";
import { useStyleStore } from "../styles/store";
import { useUserStore } from "../users/store";
import type { AuthServiceApi } from "../../../api/src/auth/model";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { useEffect } from "react";
import { useRelationStore } from "../relations/store";
import { useUserChatStore } from "../user_chats/store";
import { apiRequest } from "../api";
import useUserWebSocket from "../users/websocket";

export default function useAuthService() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const emailForSignUp = useAuthStore((state) => state.emailForSignUp);
    const passwordForSignUp = useAuthStore((state) => state.passwordForSignUp);
    const usernameForSignUp = useAuthStore((state) => state.usernameForSignUp);
    const resetSignUpInput = useAuthStore((state) => state.resetSignUpInput);

    const passwordForSignIn = useAuthStore((state) => state.passwordForSignIn);
    const emailForSignIn = useAuthStore((state) => state.emailForSignIn);
    const resetSignInInput = useAuthStore((state) => state.resetSignInInput);
    
    const resetBlogInfoState = useBlogStore((state) => state.resetBlogInfoState);
    const resetBlogWindowState = useBlogStore((state) => state.resetBlogWindowState);

    const resetCommentState = useCommentStore((state) => state.resetCommentState);

    const resetRelationState = useRelationStore((state) => state.resetRelationState);
    
    const resetNavbarState = useStyleStore((state) => state.resetNavbarState);
    const setMessage = useStyleStore((state) => state.setMessage);

    const resetUserProfileState = useUserStore((state) => state.resetUserProfileState);
    const resetUserIdState = useUserStore((state) => state.resetUserIdState);
    
    const setCurrentUserId = useUserStore((state) => state.setCurrentUserId);
    const resetMessageChatState = useUserChatStore((state) => state.resetMessageChatState);

    useUserWebSocket();
    
    const authClient = createAuthClient({
        baseURL: import.meta.env.VITE_BASE_API_URL,
        plugins: [inferAdditionalFields<AuthServiceApi>()],
        fetchOptions: { credentials: "include" }
    });

    const getCurrentUser = useQuery({
        queryKey: ["current-user"],
        queryFn: async () => {
            const [sessionResponse, meResponse] = await Promise.all([
                authClient.getSession(),
                apiRequest<any>("/api/users/show/me", { method: "GET" }),
            ]);
            
            if (sessionResponse.error || !meResponse.data) return null;

            return { 
                created_at: meResponse.data.created_at,
                description: meResponse.data.description,
                email: meResponse.data.email, 
                profile_picture: {
                    public_id: meResponse.data.profile_picture.public_id,
                    url: meResponse.data.profile_picture.url,
                },
                user_id: meResponse.data.user_id,
                user_name: meResponse.data.user_name,
                user_session: sessionResponse.data?.session ?? null
            }
        },
        
        retry: false
    });

    useEffect(() => {
        if (getCurrentUser.data && getCurrentUser.data.user_id) {
            setCurrentUserId(getCurrentUser.data.user_id);
        }
    }, [getCurrentUser.data?.user_id, setCurrentUserId]);

    const signInMt = useMutation({
        mutationFn: async () => {
            const request = await authClient.signIn.email({ 
                email: emailForSignIn.trim(), 
                password: passwordForSignIn 
            });

            if (request.error) throw new Error(request.error.message);
            return request.data.user;
        },
        onError: (error) => {
            const errorMessage = parseAuthError(error);
            setMessage(errorMessage);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["current-user"] });
            resetSignInInput();
            navigate("/home", { replace: true });
        }
    });

    const signOutMt = useMutation({
        mutationFn: async () => {
            const request = await authClient.signOut();
            if (request.error) throw new Error(request.error.message);

            return request.data;
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.setQueryData(['current-user'], null);
            queryClient.clear();
            resetSignInInput();
            resetSignUpInput();
            resetBlogInfoState();
            resetBlogWindowState();
            resetRelationState();
            resetCommentState();
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

    const signUpMt = useMutation({
        mutationFn: async () => {
            const request = await authClient.signUp.email({
                email: emailForSignUp.trim(), 
                password: passwordForSignUp, 
                name: usernameForSignUp.trim()
            });

            if (request.error) throw new Error(request.error.message);
            return request.data.user;
        },
        onError: (error) => {
            const errorMessage = parseAuthError(error);
            setMessage(errorMessage);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["current-user"] });
            resetSignInInput();
            navigate("/home", { replace: true });
        }
    });

    function parseAuthError(error: any): string {
        const message = error.message || "";
        
        if (message.includes("Invalid email address")) return "invalid email";
        
        if (message.includes("Too small: expected string to have >=1 characters")) {
            if (message.includes("password")) return "Password is required";
            if (message.includes("email")) return "Email is required";
        }

        if (message.includes("password") && message.includes("minPasswordLength")) {
            return "Password length must be 8 character";
        }

        if (message.includes("email") && message.includes("already exists")) {
            return "Email already exist";
        }
        
        return message || "something went wrong. try again later";
    };

    const isProcessing = signInMt.isPending || signOutMt.isPending || signUpMt.isPending;

    return { authClient, getCurrentUser, isProcessing, signInMt, signOutMt, signUpMt }
}
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
    
    const resetNavbarState = useStyleStore((state) => state.resetNavbarState);
    const setMessage = useStyleStore((state) => state.setMessage);

    const resetUserProfileState = useUserStore((state) => state.resetUserProfileState);
    const resetUserIdState = useUserStore((state) => state.resetUserIdState);
    const setCurrentUserId = useUserStore((state) => state.setCurrentUserId);
    
    const authClient = createAuthClient({
        baseURL: import.meta.env.VITE_BASE_API_URL,
        plugins: [inferAdditionalFields<AuthServiceApi>()],
        fetchOptions: {
            credentials: "include"
        }
    });

    const getCurrentUser = useQuery({
        queryKey: ["current-user"],
        queryFn: async () => {
            const request = await authClient.getSession();
            if (request.error || !request.data) return null;

            return { 
                created_at: request.data.user.createdAt,
                description: request.data.user.description,
                email: request.data.user.email, 
                profile_picture: {
                    public_id: request.data.user.image_public_id,
                    url: request.data.user.image,
                },
                user_id: request.data.user.id,
                user_name: request.data.user.name,
                user_session: request.data.session
            }
        },
        retry: false
    });

    useEffect(() => {
        if (getCurrentUser.data?.user_id) {
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
            resetCommentState();
            resetUserProfileState();
            resetUserIdState();
            resetNavbarState();
            useBlogStore.persist.clearStorage();
            useUserStore.persist.clearStorage();
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
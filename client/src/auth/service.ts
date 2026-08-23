import { createAuthClient } from "better-auth/react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBlogStore } from "../blogs/store";
import { useReltionshipStore } from "../relationships/store";
import { useCommentStore } from "../comments/store";
import { useStyleStore } from "../styles/store";
import { useUserStore } from "../users/store";

export default function useAuthService() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const emailForSignUp = useAuthStore((state) => state.emailForSignUp);
    const passwordForSignUp = useAuthStore((state) => state.passwordForSignUp);
    const usernameForSignUp = useAuthStore((state) => state.usernameForSignUp);
    const setSignUpMessage = useAuthStore((state) => state.setSignUpMessage);
    const resetSignUpInput = useAuthStore((state) => state.resetSignUpInput);

    const passwordForSignIn = useAuthStore((state) => state.passwordForSignIn);
    const emailForSignIn = useAuthStore((state) => state.emailForSignIn);
    const setSignInMessage = useAuthStore((state) => state.setSignInMessage);
    const resetSignInInput = useAuthStore((state) => state.resetSignInInput);
    
    const resetBlogInfoState = useBlogStore((state) => state.resetBlogInfoState);
    const resetBlogWindowState = useBlogStore((state) => state.resetBlogWindowState);

    const resetRelationShipState = useReltionshipStore((state) => state.resetRelationShipState);

    const resetCommentState = useCommentStore((state) => state.resetCommentState);
    
    const resetNavbarState = useStyleStore((state) => state.resetNavbarState);

    const resetUserProfileState = useUserStore((state) => state.resetUserProfileState);
    const resetUserIdState = useUserStore((state) => state.resetUserIdState);

    const authClient = createAuthClient({
        baseURL: new URL(`${import.meta.env.VITE_BASE_API_URL}`).origin
    });

    const getSession = () => {
        const session = authClient.useSession();

        return { 
            user_id: session.data?.user.id,
            name: session.data?.user.name, 
            email: session.data?.user.email, 
            profile_picture: session.data?.user.image,
            created_at: session.data?.user.createdAt
        }
    }

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
            setSignInMessage(error.message);
        },
        onSuccess: () => {
            navigate("/users/dashboard");
            resetSignInInput();
        }
    });

    const signOutMt = useMutation({
        mutationFn: async () => {
            const request = await authClient.signOut();
            if (request.error) throw new Error(request.error.message);

            return request.data;
        },
        onError: (error) => {
            setSignInMessage(error.message);
        },
        onSuccess: () => {
            queryClient.clear();
            resetSignInInput();
            resetSignUpInput();
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
            setSignUpMessage(error.message);
        },
        onSuccess: () => {
            navigate("/users/dashboard");
            resetSignUpInput();
        }
    });

    const isProcessing = signInMt.isPending || signOutMt.isPending || signUpMt.isPending;

    return { authClient, getSession, isProcessing, signInMt, signOutMt, signUpMt }
}
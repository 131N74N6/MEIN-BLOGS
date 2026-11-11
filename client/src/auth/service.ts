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
import { useEffect, useRef } from "react";
import { useRelationStore } from "../relations/store";
import { useUserChatStore } from "../user_chats/store";
import { apiRequest } from "../api";

export default function useAuthService() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const sseRef = useRef<EventSource | null>(null);

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
                    public_id: meResponse.data.image_public_id,
                    url: meResponse.data.image,
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

    useEffect(() => {
        if (getCurrentUser.data?.user_id) {
            const eventSource = new EventSource(`${import.meta.env.VITE_BASE_API_URL}/api/users/sse`, {
                withCredentials: true
            });

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "user:updated" || data.type === "user-profile-picture:deleted") {
                        // Invalidasi query yang menampilkan data profil user secara realtime
                        queryClient.invalidateQueries({
                            predicate: (query) => {
                                const key = query.queryKey[0];
                                if (typeof key !== 'string') return false;
                                
                                return (
                                    key === 'current-user' ||
                                    key.startsWith("all-blogs") ||
                                    key.startsWith("user-blogs-") ||
                                    key.startsWith("blog-comments-") ||
                                    key.startsWith("blog-viewers-") ||
                                    key.startsWith("blog-content-")
                                );
                            }
                        });
                    }
                } catch (err) {
                    console.error("SSE parse error", err);
                }
            };

            eventSource.onerror = (err) => {
                console.error("SSE connection error", err);
            };

            sseRef.current = eventSource;

            return () => {
                eventSource.close();
            };
        }
    }, [getCurrentUser.data?.user_id, queryClient]);

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
import { create } from "zustand";
import type { StateCreator } from "zustand";
import type { AuthUnion, SignInInput, SignUpInput } from "./model";

const signInStore: StateCreator<SignInInput> = (set) => ({
    emailForSignIn: "",
    setEmailForSignIn: (emailForSignIn: string) => set({ emailForSignIn }),

    passwordForSignIn: "",
    setPasswordForSignIn: (passwordForSignIn: string) => set({ passwordForSignIn }),

    showPasswordForSignIn: false,
    setShowPasswordForSignIn: (showPasswordForSignIn) => set({ showPasswordForSignIn }),

    resetSignInInput: () => set({
        emailForSignIn: "", passwordForSignIn: "", showPasswordForSignIn: false
    })
});

const signUpStore: StateCreator<SignUpInput> = (set) => ({
    emailForSignUp: "",
    setEmailForSignUp: (emailForSignUp: string) => set({ emailForSignUp }),

    passwordForSignUp: "",
    setPasswordForSignUp: (passwordForSignUp: string) => set({ passwordForSignUp }),

    showPasswordForSignUp: false,
    setShowPasswordForSignUp: (showPasswordForSignUp) => set({ showPasswordForSignUp }),

    usernameForSignUp: "",
    setUsernameForSignUp: (usernameForSignUp: string) => set({ usernameForSignUp }),

    resetSignUpInput: () => set({
        emailForSignUp: "", passwordForSignUp: "", usernameForSignUp: "", showPasswordForSignUp: false
    })
});

export const useAuthStore = create<AuthUnion>()((...x) => ({
    ...signInStore(...x),
    ...signUpStore(...x)
}));
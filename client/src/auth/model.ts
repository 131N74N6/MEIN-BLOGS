export type SignInInput = {
    emailForSignIn: string;
    setEmailForSignIn: (emailForSignIn: string) => void;

    passwordForSignIn: string;
    setPasswordForSignIn: (passwordForSignIn: string) => void;

    resetSignInInput: () => void;
}

export type SignUpInput = {
    emailForSignUp: string;
    setEmailForSignUp: (emailForSignUp: string) => void;

    passwordForSignUp: string;
    setPasswordForSignUp: (passwordForSignUp: string) => void;

    usernameForSignUp: string;
    setUsernameForSignUp: (usernameForSignUp: string) => void;

    resetSignUpInput: () => void;
}

export type AuthUnion = SignInInput & SignUpInput;
export type SignInInput = {
    emailForSignIn: string;
    setEmailForSignIn: (emailForSignIn: string) => void;

    signInMessage: string | undefined;
    setSignInMessage: (signInMessage: string | undefined) => void;

    passwordForSignIn: string;
    setPasswordForSignIn: (passwordForSignIn: string) => void;

    resetSignInInput: () => void;
}

export type SignUpInput = {
    emailForSignUp: string;
    setEmailForSignUp: (emailForSignUp: string) => void;

    signUpMessage: string | undefined;
    setSignUpMessage: (signUpMessage: string | undefined) => void;

    passwordForSignUp: string;
    setPasswordForSignUp: (passwordForSignUp: string) => void;

    usernameForSignUp: string;
    setUsernameForSignUp: (usernameForSignUp: string) => void;

    resetSignUpInput: () => void;
}

export type AuthUnion = SignInInput & SignUpInput;
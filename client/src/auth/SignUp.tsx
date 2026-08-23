import { useNavigate } from "react-router-dom";
import { useUserStore } from "../users/store";
import useUserService from "../users/service";
import { useEffect } from "react";
import { useAuthStore } from "./store";
import useAuthService from "./service";

export default function SignUp() {
    const navigate = useNavigate();

    const auth = useAuthService();
    const user = useUserService();

    const currentUserId = useUserStore((state) => state.currentUserId);
    
    const signUpMessage = useAuthStore((state) => state.signUpMessage);
    const setSignUpMessage = useAuthStore((state) => state.setSignUpMessage);

    const emailForSignUp = useAuthStore((state) => state.emailForSignUp);
    const setEmailForSignUp = useAuthStore((state) => state.setEmailForSignUp);

    const passwordForSignUp = useAuthStore((state) => state.passwordForSignUp);
    const setPasswordForSignUp = useAuthStore((state) => state.setPasswordForSignUp);

    const usernameForSignUp = useAuthStore((state) => state.usernameForSignUp);
    const setUsernameForSignUp = useAuthStore((state) => state.setUsernameForSignUp);

    useEffect(() => {
        if (user.getCurrentUser.isLoading === false && currentUserId !== "") {
            navigate("/users/dashboard", { replace: true });
        }
    }, [currentUserId, user.getCurrentUser.isLoading, navigate]);
    
    useEffect(() => {
        if (signUpMessage) {
            const timer = setTimeout(() => setSignUpMessage(undefined), 1800);
            return () => clearTimeout(timer);
        }
    }, [signUpMessage, setSignUpMessage]);

    const signUp = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        auth.signUpMt.mutate();
    }
    
    return (
        <div className="flex justify-center items-center h-dvh bg-background p-2.5">
            <form className="flex w-82.5 flex-col gap-2.5 p-2.5 border border-gray-500 shadow" onSubmit={signUp}>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-lg md:text-base sm:text-sm font-medium text-gray-600" htmlFor="email">email</label>
                    <input
                        className="border border-gray-500 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="email"
                        name="email"
                        onChange={(event) => setEmailForSignUp(event.target.value)}
                        type="email"
                        value={emailForSignUp}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-lg md:text-base sm:text-sm font-medium text-gray-600" htmlFor="password">password</label>
                    <input
                        className="border border-gray-500 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="password"
                        name="password"
                        onChange={(event) => setPasswordForSignUp(event.target.value)}
                        type="password"
                        value={passwordForSignUp}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-lg md:text-base sm:text-sm font-medium text-gray-600" htmlFor="username">username</label>
                    <input
                        className="border border-gray-500 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="username"
                        name="username"
                        onChange={(event) => setUsernameForSignUp(event.target.value)}
                        type="text"
                        value={usernameForSignUp}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-2">
                        <div className="text-gray-500 text-xs sm:text-sm md:text-md lg:text-lg font-medium">Already have account ?</div>
                        <button 
                            className="text-blue-500 text-xs sm:text-sm md:text-md lg:text-lg font-medium hover:underline cursor-pointer disabled:cursor-not-allowed"
                            disabled={user.isProcessing}
                            onClick={() => navigate("/sign-in")}
                            type="button"
                        >
                            Sign In
                        </button>
                    </div>
                    <button 
                        className="bg-blue-600 text-white font-medium sm:text-sm lg:text-lg md:text-md text-xs md:p-2 p-1.5 cursor-pointer disabled:cursor-not-allowed" 
                        disabled={user.isProcessing}
                        type="submit"
                    >
                        {user.isProcessing ? "Please wait..." : "Sign Up"}
                    </button>
                </div>
                {signUpMessage ? (
                    <div className="text-red-600 text-center font-medium text-xs sm:text-sm md:text-md lg:text-lg">
                        {signUpMessage}
                    </div>
                ) : null}
            </form>
        </div>
    );
}
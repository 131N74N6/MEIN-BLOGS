import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store";
import { useUserStore } from "../users/store";
import useAuthService from "./service";
import useUserService from "../users/service";

export default function SignUp() {
    const navigate = useNavigate();
    const auth = useAuthService();
    const user = useUserService();

    const currentUserId = useUserStore((state) => state.currentUserId);

    const signInMessage = useAuthStore((state) => state.signInMessage);
    const setSignInMessage = useAuthStore((state) => state.setSignInMessage);

    const passwordForSignIn = useAuthStore((state) => state.passwordForSignIn);
    const setPasswordForSignIn = useAuthStore((state) => state.setPasswordForSignIn);

    const emailForSignIn = useAuthStore((state) => state.emailForSignIn);
    const setEmailForSignIn = useAuthStore((state) => state.setEmailForSignIn);

    useEffect(() => {
        if (auth.getCurrentUser.isLoading === false && currentUserId !== "") {
            navigate("/users/dashboard", { replace: true });
        }
    }, [currentUserId, auth.getCurrentUser.isLoading, navigate]);

    useEffect(() => {
        if (signInMessage) {
            const timer = setTimeout(() => setSignInMessage(undefined), 1800);
            return () => clearTimeout(timer);
        }
    }, [signInMessage, setSignInMessage]);

    const signIn = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        auth.signInMt.mutate();
    }
    
    return (
        <div className="flex justify-center items-center h-dvh bg-background p-2.5">
            <form className="w-82.5 flex flex-col gap-2.5 p-2.5 border border-gray-400 shadow" onSubmit={signIn}>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-lg md:text-base sm:text-sm font-medium text-gray-600" htmlFor="email">Email</label>
                    <input
                        className="border border-gray-400 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="email"
                        name="email"
                        onChange={(event) => setEmailForSignIn(event.target.value)}
                        type="email"
                        value={emailForSignIn}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-lg md:text-base sm:text-sm font-medium text-gray-600" htmlFor="password">password</label>
                    <input
                        className="border border-gray-400 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="password"
                        name="password"
                        onChange={(event) => setPasswordForSignIn(event.target.value)}
                        type="password"
                        value={passwordForSignIn}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-2">
                        <div className="text-gray-400 text-xs sm:text-sm md:text-md lg:text-lg font-medium">Don't have account ?</div>
                        <button 
                            className="text-blue-400 text-xs sm:text-sm md:text-md lg:text-lg font-medium hover:underline cursor-pointer disabled:cursor-not-allowed"
                            disabled={user.isProcessing}
                            onClick={() => navigate("/sign-up")}
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
                        {user.isProcessing ? "Please wait..." : "Sign In"}
                    </button>
                </div>
                {signInMessage ? (
                    <div className="text-red-600 text-center font-medium text-xs sm:text-sm md:text-md lg:text-lg">
                        {signInMessage}
                    </div>
                ) : null}
            </form>
        </div>
    );
}
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store";
import useAuthService from "./service";
import { useUserStore } from "../users/store";
import { useStyleStore } from "../styles/store";

export default function SignIn() {
    const navigate = useNavigate();
    const auth = useAuthService();

    const emailForSignIn = useAuthStore((state) => state.emailForSignIn);
    const setEmailForSignIn = useAuthStore((state) => state.setEmailForSignIn);

    const passwordForSignIn = useAuthStore((state) => state.passwordForSignIn);
    const setPasswordForSignIn = useAuthStore((state) => state.setPasswordForSignIn);

    const message = useStyleStore((state) => state.message);
    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);

    useEffect(() => {
        if (currentUserId && !auth.getCurrentUser.isLoading) navigate("/home", { replace: true });
    }, [currentUserId, auth.getCurrentUser.data, auth.getCurrentUser.isLoading, navigate]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 1800);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    const signIn = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        auth.signInMt.mutate();
    }
    
    return (
        <section className="flex justify-center items-center h-dvh bg-background p-2.5">
            <form className="w-82.5 flex flex-col gap-2.5 p-2.5 border border-gray-400 shadow" onSubmit={signIn}>
                <h3 className="font-semibold text-xl text-gray-600">Sign In</h3>
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
                            disabled={auth.isProcessing}
                            onClick={() => navigate("/sign-up")}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>
                    <button 
                        className="bg-blue-600 text-white font-medium sm:text-sm lg:text-lg md:text-md text-xs md:p-2 p-1.5 cursor-pointer disabled:cursor-not-allowed" 
                        disabled={auth.isProcessing}
                        type="submit"
                    >
                        {auth.isProcessing ? "Please wait..." : "Sign In"}
                    </button>
                </div>
                {message ? (
                    <div className="text-red-600 text-center font-medium text-xs sm:text-sm md:text-md lg:text-lg">
                        {message}
                    </div>
                ) : null}
            </form>
        </section>
    );
}
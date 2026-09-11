import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store";
import useAuthService from "./service";
import { useUserStore } from "../users/store";
import { useStyleStore } from "../styles/store";
import { Eye, EyeClosed } from "lucide-react";
import { cn } from "../styles/utils";

export default function SignIn() {
    const navigate = useNavigate();
    const auth = useAuthService();

    const emailForSignIn = useAuthStore((state) => state.emailForSignIn);
    const setEmailForSignIn = useAuthStore((state) => state.setEmailForSignIn);

    const passwordForSignIn = useAuthStore((state) => state.passwordForSignIn);
    const setPasswordForSignIn = useAuthStore((state) => state.setPasswordForSignIn);

    const showPasswordForSignIn = useAuthStore((state) => state.showPasswordForSignIn);
    const setShowPasswordForSignIn = useAuthStore((state) => state.setShowPasswordForSignIn);

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

    const passwordToggle = () => setShowPasswordForSignIn(!showPasswordForSignIn);

    const signIn = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        auth.signInMt.mutate();
    }
    
    return (
        <section className="flex justify-center items-center h-dvh bg-background p-2.5">
            <form className="w-82.5 flex flex-col gap-2.5 p-2.5 border border-gray-400 shadow" onSubmit={signIn}>
                <h3 className="font-semibold text-xl text-gray-600">Sign In</h3>
                <div className="flex flex-col gap-1">
                    <label className="lg:text-lg md:text-base text-sm font-medium text-gray-600" htmlFor="email">Email</label>
                    <input
                        className="border border-gray-400 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="email"
                        name="email"
                        onChange={(event) => setEmailForSignIn(event.target.value)}
                        type="email"
                        value={emailForSignIn}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="lg:text-lg md:text-base text-sm font-medium text-gray-600" htmlFor="password">password</label>
                    <div className="relative">
                        <input
                            className="border border-gray-400 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                            id="password"
                            name="password"
                            onChange={(event) => setPasswordForSignIn(event.target.value)}
                            type="password"
                            value={passwordForSignIn}
                        />
                        <button
                            className={cn(
                                "text-black font-medium hover:text-zinc-700 transition-colors px-3",
                                "absolute inset-y-0 right-0 disabled:cursor-not-allowed cursor-pointer"
                            )}
                            disabled={auth.signInMt.isPending}
                            onClick={passwordToggle}
                            type="button"
                        >
                            {showPasswordForSignIn ? <Eye size={22}/> : <EyeClosed size={22}/>}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-2">
                        <div className="text-gray-400 text-sm md:text-base lg:text-lg font-medium">Don't have account ?</div>
                        <button 
                            className="text-blue-400 text-sm md:text-base lg:text-lg font-medium hover:underline cursor-pointer disabled:cursor-not-allowed"
                            disabled={auth.isProcessing}
                            onClick={() => navigate("/sign-up")}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>
                    <button 
                        className="bg-blue-600 text-white font-medium text-sm lg:text-lg md:text-md md:p-2 p-1.5 cursor-pointer disabled:cursor-not-allowed" 
                        disabled={auth.isProcessing}
                        type="submit"
                    >
                        {auth.isProcessing ? "Please wait..." : "Sign In"}
                    </button>
                </div>
                {message ? (
                    <div className="text-red-600 text-center font-medium text-sm md:text-md lg:text-lg">
                        {message}
                    </div>
                ) : null}
            </form>
        </section>
    );
}
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store";
import useAuthService from "./service";
import { useUserStore } from "../users/store";
import { useStyleStore } from "../styles/store";
import { Eye, EyeClosed } from "lucide-react";
import { cn } from "../styles/utils";

export default function SignUp() {
    const navigate = useNavigate();
    const auth = useAuthService();
    
    const message = useStyleStore((state) => state.message);
    const setMessage = useStyleStore((state) => state.setMessage);

    const emailForSignUp = useAuthStore((state) => state.emailForSignUp);
    const setEmailForSignUp = useAuthStore((state) => state.setEmailForSignUp);

    const passwordForSignUp = useAuthStore((state) => state.passwordForSignUp);
    const setPasswordForSignUp = useAuthStore((state) => state.setPasswordForSignUp);

    const showPasswordForSignUp = useAuthStore((state) => state.showPasswordForSignUp);
    const setShowPasswordForSignUp = useAuthStore((state) => state.setShowPasswordForSignUp);

    const usernameForSignUp = useAuthStore((state) => state.usernameForSignUp);
    const setUsernameForSignUp = useAuthStore((state) => state.setUsernameForSignUp);
    
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

    const signUp = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        auth.signUpMt.mutate();
    }
    
    const passwordToggle = () => setShowPasswordForSignUp(!showPasswordForSignUp);
    
    return (
        <section className="flex justify-center items-center h-dvh bg-background p-2.5 bg-orange-200">
            <form className="flex rounded-lg w-84 flex-col bg-white gap-5 p-3 border border-gray-500 shadow" onSubmit={signUp}>
                <h3 className="font-semibold text-center text-xl text-zinc-800">Sign Up</h3>
                <div className="flex flex-col gap-1.5">
                    <label className="font-medium text-zinc-800" htmlFor="email">Email</label>
                    <input
                        className="w-full ring-1 ring-zinc-800 bg-gray-100 rounded-lg p-1.5 font-medium text-zinc-800 outline-0"
                        id="email"
                        name="email"
                        onChange={(event) => setEmailForSignUp(event.target.value)}
                        placeholder="email"
                        type="email"
                        value={emailForSignUp}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="font-medium text-zinc-800" htmlFor="password">Password</label>
                    <div className="relative">
                        <input
                            className="w-full p-1.5 font-medium rounded-lg bg-gray-100 text-zinc-800 outline-none ring-1 ring-zinc-800 pr-10"
                            id="password"
                            name="password"
                            placeholder="password"
                            onChange={(event) => setPasswordForSignUp(event.target.value)}
                            type={showPasswordForSignUp ? "text" : "password"}
                            value={passwordForSignUp}
                        />
                        <button
                            className={cn(
                                "text-black font-medium hover:text-zinc-700 transition-colors px-3",
                                "absolute inset-y-0 right-0 disabled:cursor-not-allowed cursor-pointer"
                            )}
                            disabled={auth.signUpMt.isPending}
                            onClick={passwordToggle}
                            type="button"
                        >
                            {showPasswordForSignUp ? <Eye size={22}/> : <EyeClosed size={22}/>}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="font-medium text-zinc-800" htmlFor="username">Username</label>
                    <input
                        className="w-full ring-1 ring-zinc-800 bg-gray-100 rounded-lg p-1.5 font-medium text-zinc-800 outline-0"
                        id="username"
                        name="username"
                        placeholder="username"
                        onChange={(event) => setUsernameForSignUp(event.target.value)}
                        type="text"
                        value={usernameForSignUp}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-2">
                        <div className="text-blue-900 font-medium">Already have account ?</div>
                        <button 
                            className="text-blue-900 font-medium hover:underline cursor-pointer disabled:cursor-not-allowed"
                            disabled={auth.isProcessing}
                            onClick={() => navigate("/sign-in")}
                            type="button"
                        >
                            Sign In
                        </button>
                    </div>
                    <button 
                        className="bg-blue-600 rounded-lg hover:bg-blue-800 transition-colors text-white font-medium p-1.5 cursor-pointer disabled:cursor-not-allowed" 
                        disabled={auth.isProcessing}
                        type="submit"
                    >
                        {auth.isProcessing ? "Please wait..." : "Sign Up"}
                    </button>
                </div>
                {message ? (
                    <div className="text-red-600 text-center font-medium">
                        {message}
                    </div>
                ) : null}
            </form>
        </section>
    );
}
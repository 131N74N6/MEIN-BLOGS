import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store";
import useAuthService from "./service";
import { useUserStore } from "../users/store";
import { useStyleStore } from "../styles/store";
import { Eye, EyeClosed } from "lucide-react";
// import { cn } from "../styles/utils";

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
        <section className="flex justify-center items-center h-dvh bg-background p-2.5 bg-amber-200">
            <form className="w-84 bg-white flex flex-col gap-5 p-3 rounded-lg border border-gray-400 shadow" onSubmit={signIn}>
                <h3 className="font-semibold text-center text-xl text-zinc-800">Sign In</h3>
                <div className="flex flex-col gap-1">
                    <label className="lg:text-lg md:text-base text-sm font-medium text-zinc-800" htmlFor="email">Email</label>
                    <input
                        className="w-full ring-1 ring-zinc-800 bg-gray-100 rounded-lg p-1.5 font-medium text-zinc-800 outline-0"
                        id="email"
                        placeholder="email"
                        name="email"
                        onChange={(event) => setEmailForSignIn(event.target.value)}
                        type="email"
                        value={emailForSignIn}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="font-medium text-zinc-800" htmlFor="password">Password</label>
                    <div className="relative">
                        <input 
                            type={showPasswordForSignIn ? "text" : "password"}
                            value={passwordForSignIn}
                            placeholder="password"
                            id="password"
                            className="w-full p-1.5 font-medium rounded-lg bg-gray-100 text-zinc-800 outline-none ring-1 ring-zinc-800 pr-10"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPasswordForSignIn(event.target.value)}
                        />
                        <button
                            type="button"
                            onClick={passwordToggle}
                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-zinc-800 hover:text-black"
                            aria-label={showPasswordForSignIn ? "Sembunyikan password" : "Tampilkan password"}
                        >
                            {showPasswordForSignIn ? <EyeClosed size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-2">
                        <div className="text-blue-900 font-medium">Don't have account ?</div>
                        <button 
                            className="text-blue-900 font-medium hover:underline cursor-pointer disabled:cursor-not-allowed"
                            disabled={auth.isProcessing}
                            onClick={() => navigate("/sign-up")}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>
                    <button 
                        className="bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors p-1.5 cursor-pointer disabled:cursor-not-allowed" 
                        disabled={auth.isProcessing}
                        type="submit"
                    >
                        {auth.isProcessing ? "Please wait..." : "Sign In"}
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
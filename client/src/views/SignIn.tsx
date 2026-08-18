import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import useUserService from "../services/useUserService";
import { useMessageStore } from "../stores/useMessageStore";
import { useEffect } from "react";

export default function SignUp() {
    const navigate = useNavigate();

    const { getCurrentUser, signInMt, userProcessing } = useUserService();

    const currentUserId = useUserStore((state) => state.currentUserId);

    const message = useMessageStore((state) => state.message);
    const setMessage = useMessageStore((state) => state.setMessage);

    const password = useUserStore((state) => state.password);
    const setPassword = useUserStore((state) => state.setPassword);

    const username = useUserStore((state) => state.username);
    const setUsername = useUserStore((state) => state.setUsername);

    useEffect(() => {
        if (getCurrentUser.isLoading === false && currentUserId !== "") {
            navigate("/users/dashboard", { replace: true });
        }
    }, [currentUserId, getCurrentUser.isLoading, navigate]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 1800);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    const signIn = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        signInMt.mutate();
    }
    
    return (
        <div className="flex justify-center items-center h-dvh bg-background p-2.5">
            <form className="w-82.5 flex flex-col gap-2.5 p-2.5 border border-gray-400 shadow" onSubmit={signIn}>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-lg md:text-base sm:text-sm font-medium text-gray-600" htmlFor="password">password</label>
                    <input
                        className="border border-gray-400 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="password"
                        name="password"
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        value={password}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-lg md:text-base sm:text-sm font-medium text-gray-600" htmlFor="username">username</label>
                    <input
                        className="border border-gray-400 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="username"
                        name="username"
                        onChange={(event) => setUsername(event.target.value)}
                        type="text"
                        value={username}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-2">
                        <div className="text-gray-400 text-xs sm:text-sm md:text-md lg:text-lg font-medium">Don't have account ?</div>
                        <button 
                            className="text-blue-400 text-xs sm:text-sm md:text-md lg:text-lg font-medium hover:underline cursor-pointer disabled:cursor-not-allowed"
                            disabled={userProcessing}
                            onClick={() => navigate("/sign-up")}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>
                    <button 
                        className="bg-blue-600 text-white font-medium sm:text-sm lg:text-lg md:text-md text-xs md:p-2 p-1.5 cursor-pointer disabled:cursor-not-allowed" 
                        disabled={userProcessing}
                        type="submit"
                    >
                        {userProcessing ? "Please wait..." : "Sign In"}
                    </button>
                </div>
                {message ? (
                    <div className="text-red-600 text-center font-medium text-xs sm:text-sm md:text-md lg:text-lg">
                        {message}
                    </div>
                ) : null}
            </form>
        </div>
    );
}
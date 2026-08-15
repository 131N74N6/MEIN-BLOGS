import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import useUserService from "../services/useUserService";
import { useEffect } from "react";
import { useMessageStore } from "../stores/useMessageStore";

export default function SignUp() {
    const navigate = useNavigate();

    const { signOutMt, userProcessing } = useUserService();
    
    const message = useMessageStore((state) => state.message);
    const setMessage = useMessageStore((state) => state.setMessage);

    const email = useUserStore((state) => state.email);
    const setEmail = useUserStore((state) => state.setEmail);

    const password = useUserStore((state) => state.password);
    const setPassword = useUserStore((state) => state.setPassword);

    const username = useUserStore((state) => state.username);
    const setUsername = useUserStore((state) => state.setUsername);
    
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 1800);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    const signUp = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        signOutMt.mutate();
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
                        onChange={(event) => setEmail(event.target.value)}
                        type="email"
                        value={email}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs lg:text-lg md:text-base sm:text-sm font-medium text-gray-600" htmlFor="password">password</label>
                    <input
                        className="border border-gray-500 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
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
                        className="border border-gray-500 md:p-2 p-1.5 font-medium text-xs sm:text-sm md:text-base lg:text-lg mt-2 text-gray-600 outline-0"
                        id="username"
                        name="username"
                        onChange={(event) => setUsername(event.target.value)}
                        type="text"
                        value={username}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-center gap-2">
                        <div className="text-gray-500 text-xs sm:text-sm md:text-md lg:text-lg font-medium">Already have account ?</div>
                        <button 
                            className="text-blue-500 text-xs sm:text-sm md:text-md lg:text-lg font-medium hover:underline cursor-pointer disabled:cursor-not-allowed"
                            disabled={userProcessing}
                            onClick={() => navigate("/sign-in")}
                            type="button"
                        >
                            Sign In
                        </button>
                    </div>
                    <button 
                        className="bg-blue-600 text-white font-medium sm:text-sm lg:text-lg md:text-md text-xs md:p-2 p-1.5 cursor-pointer disabled:cursor-not-allowed" 
                        disabled={userProcessing}
                        type="submit"
                    >
                        {userProcessing ? "Please wait..." : "Sign Up"}
                    </button>
                </div>
            </form>
        </div>
    );
}
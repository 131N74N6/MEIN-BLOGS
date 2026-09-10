import { useNavigate } from "react-router-dom";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useUserChatService from "./service";
import { MessageCircle } from "lucide-react";
import { useEffect } from "react";
import { useStyleStore } from "../styles/store";
import Alert from "../styles/Alert";
import { useUserStore } from "../users/store";
import useUserService from "../users/service";
import MediaPreview from "./MediaPreview";

export default function ChatMediaDetail() {
    const navigate = useNavigate();
    const auth = useAuthService();
    const user = useUserService();
    const userChat = useUserChatService();

    const message = useStyleStore((state) => state.message);
    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    useEffect(() => {
        if (message) {
            const timeout = setTimeout(() => setMessage(null), 1500);
            return () => clearTimeout(timeout);
        }
    }, [message]);

    useEffect(() => {
        if (!auth.getCurrentUser.isPending && !currentUserId && !auth.getCurrentUser.data?.user_id) {
            navigate("/sign-in", { replace: true });
        }
    }, [currentUserId, auth.getCurrentUser.isPending, auth.getCurrentUser.data, navigate]);

    const isProcessing = auth.isProcessing || userChat.isProcessing;

    return (
        <section className="flex flex-col md:flex-row h-dvh relative z-10">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {message ? <Alert message={message}/> : null}
            <main className="h-full overflow-y-auto p-2.5 flex flex-col w-full md:w-3/4">
                <header className="bg-zinc-800 flex justify-between p-2.5">
                    <button 
                        className="flex-row flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
                        disabled={isProcessing}
                        onClick={() => navigate(`/users/${user.getCurrentUser.data?.user_id}`)}
                        type="button"
                    >
                        {user.getCurrentUser.data && 
                        user.getCurrentUser.data.profile_picture && 
                        user.getCurrentUser.data.profile_picture.public_id ? (
                            <div className="w-8 h-8 rounded-full">
                                <img
                                    className="w-full h-full object-cover rounded-full"
                                    alt={`${user.getCurrentUser.data.user_name}-picture`}
                                    src={user.getCurrentUser.data?.profile_picture.url}
                                />
                            </div>
                        ) : (
                            <div className="bg-amber-400 flex justify-center items-center w-8 h-8 rounded-full">
                                <p className="text-olive-800 font-medium">{user.getCurrentUser.data?.user_name[0]}</p>
                            </div>
                        )}
                        <h3 className="text-white text-base text-left font-medium">
                            {user.getCurrentUser.data?.user_name}
                        </h3>
                    </button>
                    <section className="flex gap-2">
                        <button 
                            className="text-base font-medium cursor-pointer disabled:cursor-not-allowed text-white"
                            disabled={isProcessing}
                            onClick={() => navigate(`/users/chats/${otherUserId}`)}
                            type="button"
                        >
                            <MessageCircle size={22}/>
                        </button>
                    </section>
                </header>
                <section className="border-x border-zinc-800 h-[80%] p-2 overflow-y-auto grid gap-2 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2">
                    <MediaPreview 
                        is_processing={isProcessing} 
                        place={{ 
                            name: "media-result", 
                            media: userChat.getAllUserMessagesMedia.data?.media ?? [] 
                        }}
                    />
                </section>
            </main>
        </section>
    );
}
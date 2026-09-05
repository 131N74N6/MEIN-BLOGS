import { useNavigate } from "react-router-dom";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useUserChatService from "./service";
import { CheckCircle2, Send } from "lucide-react";
import ChatList from "./ChatList";
import { useUserChatStore } from "./store";

export default function Chats() {
    const navigate = useNavigate();
    const auth = useAuthService();
    const userChat = useUserChatService();

    const chosenMessageIds = useUserChatStore((state) => state.chosenMessageIds);
    const setChosenMessageIds = useUserChatStore((state) => state.setChosenMessageIds);

    const selectMode = useUserChatStore((state) => state.selectMode);

    const isProcessing = auth.isProcessing || userChat.isProcessing;

    const hasProfilePicture = auth.getCurrentUser.data && auth.getCurrentUser.data.profile_picture && 
    auth.getCurrentUser.data.profile_picture.public_id;

    function sendMessage(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        userChat.sendMessagesMt.mutate();
    }

    return (
        <section className="flex flex-col md:flex-row h-dvh">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            <main className="h-full p-2.5 flex flex-col w-full md:w-3/4">
                <header className="bg-zinc-800 p-2.5">
                    <button 
                        className="flex-row gap-2.5 cursor-pointer disabled:cursor-not-allowed"
                        disabled={isProcessing}
                        onClick={() => navigate(`/users/${auth.getCurrentUser.data?.user_id}`)}
                        type="button"
                    >
                        {hasProfilePicture ? (
                            <div className="w-10 h-10 rounded-full">
                                <img
                                    className="w-full h-full object-cover rounded-full"
                                    alt={`${auth.getCurrentUser.data?.user_name}-picture`}
                                    src={auth.getCurrentUser.data?.profile_picture.url!}
                                />
                            </div>
                        ) : (
                            <div className="bg-amber-400 flex justify-center items-center w-10 h-10 rounded-full">
                                <p className="text-olive-800 font-medium">{auth.getCurrentUser.data?.user_name[0]}</p>
                            </div>
                        )}
                        <h3 className="text-white text-base text-left font-medium">
                            {auth.getCurrentUser.data?.user_name}
                        </h3>
                    </button>
                    <button className="text-base font-medium cursor-pointer disabled:cursor-not-allowed">
                        <CheckCircle2 size={22}/>
                    </button>
                </header>
                <section className="border-x border-zinc-800">
                    <ChatList
                        fetch_next_page={userChat.getAllUserMessages.fetchNextPage}
                        set_chosen_message_ids={setChosenMessageIds}
                        chosen_message_ids={chosenMessageIds}
                        has_next_page={userChat.getAllUserMessages.hasNextPage}
                        is_fetching_next_page={userChat.getAllUserMessages.isFetchingNextPage}
                        is_own={userChat.isYourMessage.data ?? false}
                        is_processing={isProcessing}
                        is_select_mode={selectMode}
                        messages={userChat.getAllUserMessages.data?.pages.flat() ?? []}
                    />
                </section>
                <form className="border border-zinc-800 p-2 w-full" onSubmit={sendMessage}>
                    <textarea/>
                    <button
                        className="w-10 h-10 rounded-full flex justify-center items-center cursor-pointer disabled:cursor-not-allowed bg-blue-700"
                        disabled={isProcessing}
                        type="submit"
                    >
                        <Send size={22}/>
                    </button>
                </form>
            </main>
        </section>
    );
}
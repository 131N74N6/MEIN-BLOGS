import { useNavigate } from "react-router-dom";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useUserChatService from "./service";
import { ArrowUp, Settings2, File } from "lucide-react";
import ChatList from "./ChatList";
import { useUserChatStore } from "./store";
import PopUpOption from "./PopUpOption";
import { useCallback, useEffect } from "react";
import { useStyleStore } from "../styles/store";
import Alert from "../styles/Alert";
import { useUserStore } from "../users/store";
import useUserService from "../users/service";
import type { UserMessage, WSMessage } from "./model";
import { useQueryClient } from "@tanstack/react-query";
import { useChatWS } from "./hook";

export default function Chats() {
    const navigate = useNavigate();
    const auth = useAuthService();
    const queryClient = useQueryClient();
    const user = useUserService();
    const userChat = useUserChatService();

    const message = useStyleStore((state) => state.message);
    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    const chosenMessage = useUserChatStore((state) => state.chosenMessage);
    const setChosenMessage = useUserChatStore((state) => state.setChosenMessage);

    const chatMedia = useUserChatStore((state) => state.media);

    const chosenMessageIds = useUserChatStore((state) => state.chosenMessageIds);
    const resetChosenMessageIds = useUserChatStore((state) => state.resetChosenMessageIds);
    const setChosenMessageIds = useUserChatStore((state) => state.setChosenMessageIds);

    const messageChat = useUserChatStore((state) => state.messageChat);
    const setMessageChat = useUserChatStore((state) => state.setMessageChat);

    const openPopUpOption = useUserChatStore((state) => state.openPopUpOption);
    const setOpenPopUpOption = useUserChatStore((state) => state.setOpenPopUpOption);

    const selectMode = useUserChatStore((state) => state.selectMode);
    const setSelectMode = useUserChatStore((state) => state.setSelectMode);

    const handleMessage = useCallback((ws: WSMessage) => {
        switch (ws.type) {
            case "MESSAGE_SENT": {
                const newMessage = ws.payload as UserMessage;
                
                // FIX: Pastikan _id ada sebelum dimasukkan ke cache
                if (!newMessage || !newMessage._id) {
                    console.warn("Received MESSAGE_SENT without _id", newMessage);
                    break;
                }

                queryClient.setQueryData([`user-chats-${otherUserId}`], (oldData: any) => {
                    if (!oldData) return { pages: [[newMessage]], pageParams: [1] };

                    const messageExists = oldData.pages.some((page: UserMessage[]) => {
                        return page.some((msg: UserMessage) => msg._id === newMessage._id)
                    });
                    
                    if (messageExists) return oldData;
                    
                    return { 
                        ...oldData, 
                        pages: oldData.pages.map((page: UserMessage[], index: number) => {
                            return index === 0 ? [newMessage, ...page] : page
                        })
                    };
                });

                break;
            }

            case "MESSAGE_EDITED": {
                const editedMessage = ws.payload as UserMessage;
                queryClient.setQueryData([`user-chats-${otherUserId}`], (oldData: any) => {
                    if (!oldData) return oldData;
                    return { 
                        ...oldData, 
                        pages: oldData.pages.map((page: UserMessage[]) => {
                            return page.map(message => {
                                return message._id === editedMessage._id ? editedMessage : message
                            })
                        })
                    }
                });

                break;
            }

            case "MESSAGES_DELETED": {
                const { message_ids } = ws.payload as { message_ids: string[] };
                queryClient.setQueryData([`user-chats-${otherUserId}`], (oldData: any) => {
                    if (!oldData) return oldData;
                    return { ...oldData, pages: oldData.pages.map((page: UserMessage[]) => {
                        return page.filter(message => !message_ids.includes(message._id))
                    })}
                });

                break;
            }

            case "ALL_MESSAGES_DELETED": {
                queryClient.setQueryData([`user-chats-${otherUserId}`], { pages: [[]], pageParams: [1] });

                break;
            }

            case "ERROR": {
                const errorMsg = (ws.payload as any).message || "Unknown error";
                setMessage(errorMsg);

                break;
            }
        }
    }, [otherUserId, queryClient, setMessage]);

    const { send, isConnected } = useChatWS(handleMessage);

    useEffect(() => {
        if (isConnected && currentUserId && otherUserId) {
            send("JOIN", { targetUserId: otherUserId });
            console.log(`🚪 Joining room with ${otherUserId}`);
        }
    }, [isConnected, currentUserId, otherUserId, send]);

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

    useEffect(() => {
        if (selectMode && chosenMessage) {
            setMessageChat(chosenMessage.message);
        } else if (selectMode && chosenMessageIds.length !== 1) {
            setMessageChat("");
        }
    }, [selectMode, chosenMessageIds, chosenMessage, setMessageChat]);

    const isProcessing = auth.isProcessing || userChat.isProcessing;

    const cancelSelectMode = () => {
        setChosenMessage(null);
        setMessageChat("");
        setSelectMode(false);
        resetChosenMessageIds();
    }

    const sendMessage = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isProcessing) return;

        if (selectMode && chosenMessage) {
            if (!messageChat || messageChat.trim() === chosenMessage.message) {
                cancelSelectMode();
                return;
            }

            try {
                // Kirim edit via HTTP dulu (untuk validasi backend)
                await userChat.changeMessageMt.mutateAsync(chosenMessage._id);
                
                // Broadcast edit via WebSocket ke lawan bicara
                send("EDIT", {
                    _id: chosenMessage._id,
                    message: messageChat.trim(),
                    sender_id: currentUserId,
                    receiver_id: otherUserId
                });

                cancelSelectMode();
            } catch (error: any) {
                console.error("Edit failed:", error);
                setMessage(error.message || "Failed to edit message.");
            }
            return;
        }

        if (chatMedia && chatMedia.length > 0) {
            try {
                const response = await userChat.sendMessagesMt.mutateAsync();
                if (response) send("SEND_FILE", response);

                setMessageChat("");
            } catch (error: any) {
                console.error("Send failed:", error);
                setMessage(error.message || "Failed to send message.");
            }
        } else {
            const currentMessage = messageChat?.trim() || "";
            
            try {
                send("SEND_TEXT", {
                    message: currentMessage,
                    sender_id: currentUserId,
                    receiver_id: otherUserId,
                    media: []
                });
                setMessageChat("");
            } catch (error: any) {
                console.error("WS Send failed:", error);
                setMessage("Failed to send message. Check your internet connection.");
            }
        }
    }

    const handleDeleteChosen = async () => {
        try {
            await userChat.deleteChosenMessagesMt.mutateAsync();
            
            send("DELETE_CHOSEN", {
                message_ids: chosenMessageIds,
                sender_id: currentUserId,
                receiver_id: otherUserId
            });
        } catch (error: any) {
            setMessage(error.message || "Gagal menghapus pesan");
        }
    };

    const handleDeleteAll = async () => {
        try {
            await userChat.deleteAllMessagesMt.mutateAsync();
            
            send("DELETE_ALL", {
                sender_id: currentUserId,
                receiver_id: otherUserId
            });
        } catch (error: any) {
            setMessage(error.message || "Gagal menghapus semua pesan");
        }
    };

    return (
        <section className="flex flex-col md:flex-row h-dvh relative z-10">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {message ? <Alert message={message}/> : null}
            {!openPopUpOption ? null : (
                <PopUpOption
                    isProcessing={isProcessing}
                    clearAll={userChat.clearAllMessagesMt}
                    chosenMessageIds={chosenMessageIds}
                    clearChosen={userChat.clearChosenMessagesMt}
                    deleteAll={{ ...userChat.deleteAllMessagesMt, mutate: handleDeleteAll }}
                    deleteChosen={{ ...userChat.deleteChosenMessagesMt, mutate: handleDeleteChosen }}
                />
            )}
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
                            onClick={() => setOpenPopUpOption(true)}
                            type="button"
                        >
                            <Settings2 size={22}/>
                        </button>
                    </section>
                </header>
                <ChatList
                    fetch_next_page={userChat.getAllUserMessages.fetchNextPage}
                    set_chosen_message_ids={setChosenMessageIds}
                    chosen_message_ids={chosenMessageIds}
                    has_next_page={userChat.getAllUserMessages.hasNextPage}
                    is_fetching_next_page={userChat.getAllUserMessages.isFetchingNextPage}
                    is_processing={isProcessing}
                    is_select_mode={selectMode}
                    messages={userChat.getAllUserMessages.data?.pages.flatMap(data => data).reverse() ?? []}
                />
                <form className="border flex h-[20%] items-center gap-2 border-zinc-800 p-2 w-full" onSubmit={sendMessage}>
                    <textarea
                        className="resize-none h-full w-full outline-0 font-medium text-sm text-gray-800"
                        onChange={(event) => setMessageChat(event.target.value)}
                        value={messageChat}
                    />
                    <section className="flex flex-col gap-1.5">
                        <button
                            className="w-8 h-8 text-white rounded-full flex justify-center items-center cursor-pointer disabled:cursor-not-allowed bg-blue-700"
                            disabled={isProcessing}
                            type="submit"
                        >
                            <ArrowUp size={16}/>
                        </button>
                        <button
                            className="w-8 h-8 text-white rounded-full flex justify-center items-center cursor-pointer disabled:cursor-not-allowed bg-blue-700"
                            disabled={isProcessing}
                            onClick={() => navigate(`/users/chats/${otherUserId}/media`)}
                            type="button"
                        >
                            <File size={16}/>
                        </button>
                    </section>
                </form>
            </main>
        </section>
    );
}
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useUserStore } from "../users/store";
import { apiRequest, apiUpload } from "../handler/api";
import { useStyleStore } from "../styles/store";
import { useUserChatStore } from "./store";
import { useRef } from "react";
import type { FileViewerData, UserMessage } from "./model";

export default function useUserChatService() {
    const queryClient = useQueryClient();
    const chatMediaRef = useRef<HTMLInputElement | null>(null);

    const setMessage = useStyleStore((state) => state.setMessage);
    
    const chosenMessageIds = useUserChatStore((state) => state.chosenMessageIds);
    const resetChosenMessageIds = useUserChatStore((state) => state.resetChosenMessageIds);
    const setSelectMode = useUserChatStore((state) => state.setSelectMode);

    const chatMedia = useUserChatStore((state) => state.media);
    const setChatMedia = useUserChatStore((state) => state.setMedia);

    const messageChat = useUserChatStore((state) => state.messageChat);
    const setMessageChat = useUserChatStore((state) => state.setMessageChat);

    const setOpenPopUpOption = useUserChatStore((state) => state.setOpenPopUpOption);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    const changeMessageMt = useMutation({
        mutationFn: async () => {
            const endpoint = "/api/chats/remake";
            const newMessage = JSON.stringify({ message: messageChat?.trim(), _id: chosenMessageIds[0] });
            return await apiRequest<UserMessage>(endpoint, { body: newMessage, method: "PUT" });
        },
        // OPTIMISTIC UPDATE: Langsung update UI sebelum response dari server
        onMutate: async (messageId: string) => {
            await queryClient.cancelQueries({ queryKey: [`user-chats-${otherUserId}`] });
            
            const previousMessages = queryClient.getQueryData<InfiniteData<UserMessage[], unknown>>(
                [`user-chats-${otherUserId}`]
            );

            if (previousMessages) {
                queryClient.setQueryData(
                    [`user-chats-${otherUserId}`],
                    (old: InfiniteData<UserMessage[], unknown> | undefined) => {
                        if (!old) return old;
                        return {
                            ...old,
                            pages: old.pages.map(page =>
                                page.map(msg =>
                                    msg._id === messageId
                                        ? { ...msg, message: messageChat?.trim() || msg.message, updated_at: new Date().toISOString() }
                                        : msg
                                )
                            )
                        };
                    }
                );
            }

            return { previousMessages };
        },
        onError: (error: any, _variables, context) => {
            // Rollback jika gagal
            if (context?.previousMessages) {
                queryClient.setQueryData(
                    [`user-chats-${otherUserId}`],
                    context.previousMessages
                );
            }
            setMessage(error.message || "Failed to edit message");
        },
        onSuccess: () => {
            // FIXED: Reset semua state setelah edit berhasil
            setMessageChat("");
            setSelectMode(false);
            resetChosenMessageIds();
            // Query akan di-refetch otomatis untuk sinkronisasi timestamp server
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
        }
    });

    const clearAllMessagesMt = useMutation({
        mutationFn: async () => {
            const endpoint = `/api/chats/clear-all?receiver_id=${otherUserId}`;
            return await apiRequest(endpoint, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            setOpenPopUpOption(false);
        }
    });

    const clearChosenMessagesMt = useMutation({
        mutationFn: async () => {
            const endpoint = "/api/chats/clear-chosen";

            const deletedMessages = JSON.stringify({ 
                receiver_id: otherUserId, 
                message_ids: chosenMessageIds 
            });

            return await apiRequest(endpoint, { body: deletedMessages, method: "DELETE"  });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            setOpenPopUpOption(false);
        }
    });

    const deleteAllMessagesMt = useMutation({
        mutationFn: async () => {
            const endpoint = `/api/chats/rm-all?receiver_id=${otherUserId}`;
            return await apiRequest(endpoint, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            setOpenPopUpOption(false);
        }
    });

    const deleteChosenMessagesMt = useMutation({
        mutationFn: async () => {
            const endpoint = "/api/chats/rm-chosen";

            const deletedMessages = JSON.stringify({ 
                receiver_id: otherUserId, 
                message_ids: chosenMessageIds 
            });

            return await apiRequest(endpoint, { body: deletedMessages, method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            setOpenPopUpOption(false);
        }
    });

    const getAllUserMessages = useInfiniteQuery({
        enabled: !!currentUserId && !!otherUserId && currentUserId !== otherUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 50) return;
            return allPages.length + 1;
        },
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1}: { pageParam?: number }) => {
            const endpoint = `/api/chats/show?receiver_id=${otherUserId}&page=${pageParam}&limit=${52}`;
            const request = await apiRequest<UserMessage[]>(endpoint, { method: "GET" });
            return request.data ?? [];
        },
        queryKey: [`user-chats-${otherUserId}`]
    });

    const getMessage = useQuery({
        enabled: chosenMessageIds.length === 1,
        queryFn: async () => {
            const endpoint = `/api/chats/messages/${chosenMessageIds[0]}`;
            const request = await apiRequest<UserMessage>(endpoint, { method: "GET" });
            return request.data;
        },
        queryKey: [`message-${chosenMessageIds[0]}`]
    });

    const sendMessagesMt = useMutation({
        mutationFn: async () => {
            const newMessage = new FormData();
            if (messageChat) newMessage.append("message", messageChat.trim());
            if (otherUserId) newMessage.append("receiver_id", otherUserId);
            if (chatMedia && chatMedia.length > 0) {
                for (let w = 0; w < chatMedia.length; w++) {
                    newMessage.append("media", chatMedia[w].file);
                }
            }

            return await apiUpload("/api/chats/send", newMessage, "POST");
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            setMessageChat("");
            setChatMedia([]);
        }
    });

    function inputChatMediaHandler(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        const selected: FileViewerData[] = [];

        if (!files || files.length === 0) return;

        for (let b = 0; b < files.length; b++) {
            selected.push({ file: files[b], filename: files[b].name, filetype: files[b].type });
        }

        setChatMedia((prev) => [...prev, ...selected]);
        if (chatMediaRef.current) chatMediaRef.current.value = "";
    }

    const isProcessing = [
        deleteAllMessagesMt, deleteChosenMessagesMt, clearAllMessagesMt, clearChosenMessagesMt, 
        changeMessageMt, sendMessagesMt
    ].some(m => m.isPending);

    return {
        changeMessageMt,
        clearAllMessagesMt,
        clearChosenMessagesMt,
        deleteAllMessagesMt,
        deleteChosenMessagesMt,
        getAllUserMessages,
        inputChatMediaHandler,
        isProcessing,
        getMessage,
        sendMessagesMt
    }
}
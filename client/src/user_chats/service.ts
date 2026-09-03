import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../users/store";
import { apiRequest, apiUpload } from "../handler/api";
import { useStyleStore } from "../styles/store";
import { useUserChatStore } from "./store";
import { useRef } from "react";
import type { FileViewerData, UserMessageData } from "./model";

export default function useUserChatService() {
    const queryClient = useQueryClient();
    const chatMediaRef = useRef<HTMLInputElement | null>(null);

    const setMessage = useStyleStore((state) => state.setMessage);
    
    const chosenMessageIds = useUserChatStore((state) => state.chosenMessageIds);

    const chatMedia = useUserChatStore((state) => state.media);
    const setChatMedia = useUserChatStore((state) => state.setMedia);

    const messageChat = useUserChatStore((state) => state.messageChat);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

    const changeMessageMt = useMutation({
        mutationFn: async () => {
            const newMessage = new FormData();
            newMessage.append("message", messageChat.trim());

            return await apiUpload("/api/chats/remake", newMessage, "PUT");
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`]});
        }
    });

    const clearAllMessagesMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/chats/clear-all?receiver_id=${otherUserId}`, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`]});
        }
    });

    const clearChosenMessagesMt = useMutation({
        mutationFn: async () => {
            const deletedMessages = { receiver_id: otherUserId, message_ids: chosenMessageIds };

            return await apiRequest("/api/chats/clear-chosen", {
                body: JSON.stringify(deletedMessages),
                method: "DELETE" 
            });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`]});
        }
    });

    const deleteAllMessagesMt = useMutation({
        mutationFn: async () => {
            return await apiRequest(`/api/chats/rm-all?receiver_id=${otherUserId}`, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`]});
        }
    });

    const deleteChosenMessagesMt = useMutation({
        mutationFn: async () => {
            const deletedMessages = { receiver_id: otherUserId, message_ids: chosenMessageIds };

            return await apiRequest(`/api/chats/rm-chosen?receiver_id=${otherUserId}`, {
                body: JSON.stringify(deletedMessages),
                method: "DELETE"
            });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`]});
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
            const endpoint = `/api/chats/show?receiver_id=${otherUserId}&page=${pageParam}&limit=${50}`;
            const request = await apiRequest<UserMessageData[]>(endpoint, { method: "GET" });

            return request.data ?? [];
        },
        queryKey: [`user-chats-${otherUserId}`]
    });

    const sendMessagesMt = useMutation({
        mutationFn: async () => {
            const newMessage = new FormData();
            newMessage.append("message", messageChat.trim());
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
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`]});
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

    const isProcessing = deleteAllMessagesMt.isPending || deleteChosenMessagesMt.isPending ||
    clearAllMessagesMt.isPending || clearChosenMessagesMt.isPending || changeMessageMt.isPending ||
    sendMessagesMt.isPending;

    return {
        changeMessageMt,
        clearAllMessagesMt,
        clearChosenMessagesMt,
        deleteAllMessagesMt,
        deleteChosenMessagesMt,
        getAllUserMessages,
        inputChatMediaHandler,
        isProcessing,
        sendMessagesMt
    }
}
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    
    const chosenMessageId = useUserChatStore((state) => state.chosenMessageId);
    const chosenMessageIds = useUserChatStore((state) => state.chosenMessageIds);

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
            const newMessage = JSON.stringify({ message: messageChat?.trim(), _id: chosenMessageId });
            return await apiRequest(endpoint, { body: newMessage, method: "PUT" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
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
            queryClient.removeQueries({ queryKey: [`is-yours-${currentUserId}`] });
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
            queryClient.removeQueries({ queryKey: [`is-yours-${currentUserId}`] });
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
            queryClient.removeQueries({ queryKey: [`is-yours-${currentUserId}`] });
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
            queryClient.removeQueries({ queryKey: [`is-yours-${currentUserId}`] });
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
            const endpoint = `/api/chats/show?receiver_id=${otherUserId}&page=${pageParam}&limit=${50}`;
            const request = await apiRequest<UserMessage[]>(endpoint, { method: "GET" });
            return request.data ?? [];
        },
        queryKey: [`user-chats-${otherUserId}`]
    });

    const isYourMessage = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            const request = await apiRequest<boolean>("/api/chats/is-it-yours", { method: "GET" });
            return request.data ?? false;
        },
        queryKey: [`is-yours-${currentUserId}`]
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
            queryClient.invalidateQueries({ queryKey: [`is-yours-${currentUserId}`] });
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
        isYourMessage,
        sendMessagesMt
    }
}
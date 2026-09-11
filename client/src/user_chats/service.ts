import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../users/store";
import { apiRequest, apiUpload } from "../api";
import { useStyleStore } from "../styles/store";
import { useUserChatStore } from "./store";
import { useEffect, useRef } from "react";
import type { FileViewerData, UserMessage } from "./model";
import { userChatWebSocket } from './event';

export default function useUserChatService() {
    const queryClient = useQueryClient();
    const chatMediaRef = useRef<HTMLInputElement | null>(null);

    const setMessage = useStyleStore((state) => state.setMessage);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);
    
    const setChosenMessage = useUserChatStore((state) => state.setChosenMessage);
    const setOpenPopUpOption = useUserChatStore((state) => state.setOpenPopUpOption);

    const chosenMessageIds = useUserChatStore((state) => state.chosenMessageIds);
    const resetChosenMessageIds = useUserChatStore((state) => state.resetChosenMessageIds);
    const setSelectMode = useUserChatStore((state) => state.setSelectMode);

    const chatMedia = useUserChatStore((state) => state.media);
    const setChatMedia = useUserChatStore((state) => state.setMedia);

    const messageChat = useUserChatStore((state) => state.messageChat);
    const setMessageChat = useUserChatStore((state) => state.setMessageChat);

    const chosenMessageId = useUserChatStore((state) => state.chosenMessageId);

    const getSessionToken = useQuery({
        enabled: !!currentUserId,
        queryFn: async () => {
            const response = await apiRequest<string>("/api/users/session", { method: "GET" });
            return response.data;
        },
        queryKey: [`user-session-token-${currentUserId}`],
        retry: 3,
        retryDelay: 1000,
    });

    useEffect(() => {
        if (!currentUserId || !otherUserId) return;
        if (getSessionToken.isLoading || !getSessionToken.data) return;

        const token = getSessionToken.data;
        if (!token || typeof token !== 'string') {
            setMessage("Authentication failed");
            return;
        }

        const backendUrl = import.meta.env.VITE_BASE_API_URL;
        
        userChatWebSocket.enableReconnect();
        userChatWebSocket.connect(token, otherUserId, backendUrl);

        const handleConnected = (payload: any) => {
            setMessage(payload.message);
        };

        const handleMessage = (payload: any) => {
            if (payload.type === "error") {
                setMessage(payload.message);
                return;
            }

            const queryKey = [`user-chats-${otherUserId}`];
            
            if (payload.type === "message:created") {
                queryClient.setQueryData(queryKey, (old: any) => {
                    if (!old) return old;
                    const newPages = [...old.pages];
                    
                    newPages[0] = [payload.data, ...newPages[0]];
                    return { ...old, pages: newPages };
                });
            } else if (payload.type === "message:updated") {
                queryClient.setQueryData(queryKey, (old: any) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page: any[]) => {
                        return page.map((message) => {
                            return message._id === payload.data._id ? payload.data : message
                        });
                    });
                    return { ...old, pages: newPages };
                });
            } else if (payload.type === "message:deleted") {
                queryClient.setQueryData(queryKey, (old: any) => {
                    if (!old) return old;
                    const newPages = old.pages.map((page: any[]) => {
                        return page.map((message) => {
                            if (payload.data.ids.includes(message._id)) {
                                return {
                                    ...message,
                                    message: "This message has been deleted", 
                                    media: []
                                }
                            }
                            return message;
                        });
                    });
                    return { ...old, pages: newPages };
                });
            }
        }

        const handleReconnecting = (payload: any) => {
            setMessage(payload.message);
        }

        const handleMaxRetries = (payload: any) => {
            setMessage(payload.message);
            userChatWebSocket.disconnect();
        }

        const handleDisconnected = () => {
            //
        }
        
        const handleError = (payload: any) => {
            const msg = payload.message;
            setMessage(msg);

            if (msg.includes("not allowed") || msg.includes("Invalid user")) {
                userChatWebSocket.disconnect();
            }
        }
        
        userChatWebSocket.on("connected", handleConnected);
        userChatWebSocket.on("message", handleMessage);
        userChatWebSocket.on("disconnected", handleDisconnected);
        userChatWebSocket.on("error", handleError);
        userChatWebSocket.on("reconnecting", handleReconnecting);
        userChatWebSocket.on("max_retries", handleMaxRetries);

        return () => {
            userChatWebSocket.off("connected", handleConnected);
            userChatWebSocket.off("message", handleMessage);
            userChatWebSocket.off("disconnected", handleDisconnected);
            userChatWebSocket.off("error", handleError);
            userChatWebSocket.off("reconnecting", handleReconnecting);
            userChatWebSocket.off("max_retries", handleMaxRetries);
        }
    }, [
        currentUserId, 
        otherUserId, 
        queryClient, 
        getSessionToken.data, 
        getSessionToken.isLoading,
        getSessionToken.error,
        setMessage
    ]);

    const changeMessageMt = useMutation({
        mutationFn: async (id: string) => {
            const endpoint = "/api/chats/remake";
            const message = messageChat?.trim() ?? "";

            const newMessage = JSON.stringify({ _id: id, message: message, receiver_id: otherUserId });
            return await apiRequest<UserMessage>(endpoint, { body: newMessage, method: "PUT" });
        },
        onError: (error) => {
            setMessage(error.message || "Failed to edit message");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            setMessageChat("");
            setSelectMode(false);
            setChosenMessage(null);
            resetChosenMessageIds();
            setOpenPopUpOption(false);
            resetChosenMessageIds();
        }
    });

    const clearAllMessagesMt = useMutation({
        mutationFn: async () => {
            const endpoint = `/api/chats/clear-all/${otherUserId}`;
            return await apiRequest(endpoint, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            setMessageChat("");
            setChosenMessage(null);
            resetChosenMessageIds();
            setOpenPopUpOption(false);
            resetChosenMessageIds();
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
            setMessageChat("");
            setSelectMode(false);
            setChosenMessage(null);
            resetChosenMessageIds();
            setOpenPopUpOption(false);
            resetChosenMessageIds();
        }
    });

    const deleteAllMessagesMt = useMutation({
        mutationFn: async () => {
            const endpoint = `/api/chats/rm-all/${otherUserId}`;
            return await apiRequest(endpoint, { method: "DELETE" });
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            queryClient.invalidateQueries({ queryKey: [`user-chats-media-${otherUserId}`] });
            setMessageChat("");
            setChosenMessage(null);
            resetChosenMessageIds();
            setOpenPopUpOption(false);
            resetChosenMessageIds();
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
            queryClient.invalidateQueries({ queryKey: [`user-chats-media-${otherUserId}`] });
            setMessageChat("");
            setSelectMode(false);
            setChosenMessage(null);
            resetChosenMessageIds();
            setOpenPopUpOption(false);
            resetChosenMessageIds();
        }
    });

    const getAllUserMessages = useInfiniteQuery({
        enabled: !!currentUserId && !!otherUserId && currentUserId !== otherUserId,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 52) return undefined;
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

    const getChosenMessageFilesForUser = useQuery({
        enabled: !!chosenMessageId,
        queryFn: async () => {
            const endpoint = `/api/chats/media/show?_id=${chosenMessageId}`;
            const request = await apiRequest<Pick<UserMessage, "media">>(endpoint, { method: "GET" });
            return request.data;
        },
        queryKey: [`user-chats-media-${chosenMessageId}`]
    });

    const sendMessagesMt = useMutation({
        mutationFn: async () => {
            const message = messageChat?.trim() ?? "";
            const newMessage = new FormData();
            newMessage.append("message", message);
            if (otherUserId) newMessage.append("receiver_id", otherUserId);
            if (chatMedia && chatMedia.length > 0) {
                for (let w = 0; w < chatMedia.length; w++) {
                    newMessage.append("media", chatMedia[w].file);
                }
            }

            const request = await apiUpload<UserMessage>("/api/chats/send", newMessage, "POST");
            return request.data;
        },
        onError: (error) => {
            setMessage(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`user-chats-${otherUserId}`] });
            setMessageChat("");
            resetChosenMessageIds();
            setChosenMessage(null);
            setChatMedia([]);
        }
    });

    function getMessage(): UserMessage | undefined {
        if (chosenMessageIds.length !== 1) return undefined;
        
        const allMessages = getAllUserMessages.data?.pages.flat() ?? [];
        return allMessages.find(msg => msg._id === chosenMessageIds[0]);
    }

    function inputChatMediaHandler(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        const selected: FileViewerData[] = [];

        if (!files || files.length === 0) return;

        for (let b = 0; b < files.length; b++) {
            selected.push({ 
                file: files[b], 
                filename: files[b].name, 
                filetype: files[b].type, 
                url: URL.createObjectURL(files[b]) 
            });
        }

        setChatMedia((prev) => [...prev, ...selected]);
        if (chatMediaRef.current) chatMediaRef.current.value = "";
    }

    const isProcessing = [
        deleteAllMessagesMt, 
        deleteChosenMessagesMt, 
        clearAllMessagesMt, 
        clearChosenMessagesMt, 
        changeMessageMt, 
        sendMessagesMt
    ].some(m => m.isPending);

    return {
        changeMessageMt,
        chatMediaRef,
        clearAllMessagesMt,
        clearChosenMessagesMt,
        deleteAllMessagesMt,
        deleteChosenMessagesMt,
        getAllUserMessages,
        getChosenMessageFilesForUser,
        inputChatMediaHandler,
        isProcessing,
        getMessage,
        sendMessagesMt
    }
}
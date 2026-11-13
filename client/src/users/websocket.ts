import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "./store";
import { useCallback, useEffect, useRef } from "react";
import { apiRequest } from "../api";
import { useStyleStore } from "../styles/store";

export default function useUserWebSocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queryClient = useQueryClient();
    const setMessage = useStyleStore((state) => state.setMessage);
    const currentUserId = useUserStore((state) => state.currentUserId);

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

    function buildWsUrl(backendUrl: string, token: string) {
        const wsProtocol = backendUrl.startsWith("https") ? "wss:" : "ws:";
        const backendHost = backendUrl.replace(/^https?:\/\//, "");
        const encodedToken = encodeURIComponent(token);
        const wsUrl = `${wsProtocol}//${backendHost}/api/users/ws?token=${encodedToken}`;
        return wsUrl;
    }

    const connect = useCallback(() => {
        if (!currentUserId) return;
        if (getSessionToken.isLoading || !getSessionToken.data) return;

        const token = getSessionToken.data;
        
        if (!token || typeof token !== 'string') {
            setMessage("Authentication failed");
            return;
        }
        
        const wsUrl = buildWsUrl(`${import.meta.env.VITE_BASE_API_URL}`, token);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            const heartbeat = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "ping" }));
            }, 30000);
            (ws as any).heartbeatInterval = heartbeat;
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === "pong") return;

            if (data.type === "error") {
                setMessage(data.message);
                return;
            }

            if (
                data.type === "user:deleted" || 
                data.type === "user:profile-picture-deleted" || 
                data.type === "user:updated"
            ) {
                queryClient.invalidateQueries({
                    predicate: (query) => {
                        const key = query.queryKey[0];
                        if (typeof key !== 'string') return false;

                        return (
                            key === "current-user" ||
                            key.startsWith("all-blogs") ||
                            key.startsWith("user-blogs-") ||
                            key.startsWith("other-user-") ||
                            key.startsWith("blog-comments-") ||
                            key.startsWith("blog-viewers-") ||
                            key.startsWith("blog-content-") ||
                            key.startsWith("followers-") || 
                            key.startsWith("followed-") ||  
                            key.startsWith("has-followed-")
                        );
                    }
                });
            }
        }

        ws.onclose = () => {
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }

        ws.onerror = () => {
            ws.close();
        }
    }, [currentUserId, queryClient]);

    useEffect(() => {
        connect();

        return () => {
            if (wsRef.current) {
                clearInterval((wsRef.current as any).heartbeatInterval);

                if (wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.close(1000, "Component unmounted");
                }
            }

            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        }
    }, [connect]);

    return wsRef.current;
}
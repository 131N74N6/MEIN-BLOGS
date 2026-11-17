import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "./store";
import { useEffect, useRef } from "react";
import { apiRequest } from "../api";
import { useStyleStore } from "../styles/store";

function buildWsUrl(backendUrl: string, token: string) {
    const wsProtocol = backendUrl.startsWith("https") ? "wss:" : "ws:";
    const backendHost = backendUrl.replace(/^https?:\/\//, "");
    const encodedToken = encodeURIComponent(token);
    const wsUrl = `${wsProtocol}//${backendHost}/api/users/ws?token=${encodedToken}`;
    return wsUrl;
}

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
    
    useEffect(() => {
        let isMounted = true;

        function connect() {
            if (!currentUserId || getSessionToken.isLoading || !getSessionToken.data || !isMounted) return;
    
            const token = getSessionToken.data;
            
            if (!token || typeof token !== 'string') {
                setMessage("Authentication failed");
                return;
            }
            
            const wsUrl = buildWsUrl(`${import.meta.env.VITE_BASE_API_URL}`, token);

            if (wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.url === wsUrl) return;
            if (wsRef.current) wsRef.current.close(1000, "Reconnecting...");

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
    
            ws.onclose = (event) => {
                if (!isMounted) return;
                if (!currentUserId) return;
                if ((ws as any).heartbeatInterval) clearInterval((ws as any).heartbeatInterval);
                if (event.code === 4001 || event.code === 4002) return;

                reconnectTimeoutRef.current = setTimeout(() => {
                    if (isMounted) connect();
                }, 3000);
            }
    
            ws.onerror = () => {
                if (!isMounted) return;
                ws.close();
            }
        }

        connect();

        return () => {
            isMounted = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            if (wsRef.current) {
                if ((wsRef.current as any).heartbeatInterval) {
                    clearInterval((wsRef.current as any).heartbeatInterval);
                }

                if (
                    wsRef.current.readyState === WebSocket.OPEN ||
                    wsRef.current.readyState === WebSocket.CONNECTING
                ) {
                    wsRef.current.close(1000, "Unmounted");
                }

                wsRef.current = null;
            }
        }
    }, [currentUserId, getSessionToken.data, getSessionToken.isLoading, queryClient, setMessage]);

    return wsRef.current;
}
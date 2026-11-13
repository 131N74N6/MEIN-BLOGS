import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "./store";
import { useCallback, useEffect, useRef } from "react";

export default function useUserWebSocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queryClient = useQueryClient();
    const currentUserId = useUserStore((state) => state.currentUserId);

    function buildWsUrl(backendUrl: string) {
        const wsProtocol = backendUrl.startsWith("https") ? "wss:" : "ws:";
        const backendHost = backendUrl.replace(/^https?:\/\//, "");
        const wsUrl = `${wsProtocol}//${backendHost}/api/users/ws`;
        return wsUrl;
    }

    const connect = useCallback(() => {
        if (!currentUserId) return;
        
        const wsUrl = buildWsUrl(`${import.meta.env.VITE_BASE_API_URL}`);
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
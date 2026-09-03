import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatMessagePayload, WSMessage } from "./model";

export const useChatWS = (onMessage: (data: WSMessage) => void) => {
    const wsRef = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);
    
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    const reconnectAttemptsRef = useRef(0);
    const isMountedRef = useRef(true);
    const shouldReconnectRef = useRef(true);
    
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        isMountedRef.current = true;
        shouldReconnectRef.current = true;
        const wsUrl = import.meta.env.VITE_WEBSOCKET_CHAT_URL;

        const connect = () => {
            if (!isMountedRef.current || !shouldReconnectRef.current) return;
            
            // Cleanup old connection if exist
            if (wsRef.current) {
                wsRef.current.onopen = null;
                wsRef.current.onclose = null;
                wsRef.current.onmessage = null;
                wsRef.current.onerror = null;
                if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
                    wsRef.current.close();
                }
            }
            
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("✅ WS Connected");
                setIsConnected(true);
                reconnectAttemptsRef.current = 0;
                
                // HEARTBEAT: keep connection stay alive
                if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: "ping", payload: {} }));
                    }
                }, 30000);
            };
            
            ws.onmessage = (event) => {
                try {
                    const data: WSMessage = JSON.parse(event.data);
                    if (data.type === "pong") return;
                    onMessageRef.current(data);
                } catch (err) {
                    console.error("Failed to parse WS message", err);
                }
            };

            ws.onclose = (event) => {
                console.log("❌ WS Disconnected", event.reason);
                setIsConnected(false);
                
                // Stop heartbeat
                if (heartbeatIntervalRef.current) {
                    clearInterval(heartbeatIntervalRef.current);
                    heartbeatIntervalRef.current = null;
                }
                
                // Reconnect
                if (isMountedRef.current && shouldReconnectRef.current && event.code !== 1000 && reconnectAttemptsRef.current < 10) {
                    const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30000); // Max 30 detik
                    reconnectAttemptsRef.current++;
                    console.log(`🔄 Attempting WS reconnect in ${delay}ms... (attempt ${reconnectAttemptsRef.current})`);
                    reconnectTimeoutRef.current = setTimeout(connect, delay);
                }
            };

            ws.onerror = (error) => {
                console.error("WS Error:", error);
            };
        };

        connect();

        // Faster reconnect if user back to tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && !isConnected && isMountedRef.current) {
                console.log("👁️ Tab visible, attempting immediate reconnect...");
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }
                reconnectAttemptsRef.current = 0;
                connect();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Cleanup Function
        return () => {
            isMountedRef.current = false;
            shouldReconnectRef.current = false;
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
                heartbeatIntervalRef.current = null;
            }
            if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
                wsRef.current.close(1000, "Component unmounted");
            }
        };
    }, []); // once mount!

    const send = useCallback((type: string, payload: ChatMessagePayload | Record<string, any>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const messageData: WSMessage = { type, payload };
            wsRef.current.send(JSON.stringify(messageData));
            return true;
        } else {
            console.warn("⚠️ Cannot send message: WebSocket is not connected.");
            return false;
        }
    }, []);

    const disconnect = useCallback(() => {
        shouldReconnectRef.current = false;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
        wsRef.current?.close(1000, "Manual disconnect");
    }, []);

    return { send, isConnected, disconnect };
};
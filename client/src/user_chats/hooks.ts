import { useEffect, useRef } from "react";

export const useChatWS = (onMessage: (data: any) => void) => {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Cookie session akan otomatis dikirim karena browser menangani WebSocket handshake
        const wsUrl = import.meta.env.VITE_WEBSOCKET_CHAT_URL;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => console.log("✅ WS Connected");
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (err) {
                console.error("Failed to parse WS message", err);
            }
        };

        ws.onclose = () => console.log("❌ WS Disconnected");

        return () => ws.close();
    }, [onMessage]);

    const send = (type: string, payload: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            // Pastikan payload TIDAK mengandung objek File. 
            // Jika ada media, upload via HTTP dulu, lalu kirim URL-nya di sini.
            wsRef.current.send(JSON.stringify({ type, payload }));
        }
    };

    return { send };
};
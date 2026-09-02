import type { ServerWebSocket } from "bun";

// Menyimpan koneksi aktif: Map<userId, WebSocket>
export const activeConnections = new Map<string, ServerWebSocket<any>>();

export function addUserConnection(userId: string, ws: ServerWebSocket<any>) {
    activeConnections.set(userId, ws);
    console.log(`✅ User ${userId} connected. Total connections: ${activeConnections.size}`);
}

export function removeUserConnection(userId: string) {
    activeConnections.delete(userId);
    console.log(`❌ User ${userId} disconnected. Total connections: ${activeConnections.size}`);
}

export function sendToUser(userId: string, payload: any) {
    const ws = activeConnections.get(userId);
    if (ws && ws.readyState === 1) { // 1 = OPEN
        ws.send(JSON.stringify(payload));
        return true;
    }
    return false;
}

export function broadcastToChatParticipants(senderId: string, receiverId: string, payload: any) {
    sendToUser(senderId, payload);
    sendToUser(receiverId, payload);
}
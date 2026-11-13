export type UserWebSocketData = {
    send(data: string | ArrayBuffer | SharedArrayBuffer): void;
    readyState: number;
}

export const userWebSocketTunnels = new Map<string, Set<UserWebSocketData>>();

export function addTunnel(user_id: string, ws: UserWebSocketData) {
    if (!userWebSocketTunnels.has(user_id)) userWebSocketTunnels.set(user_id, new Set());
    userWebSocketTunnels.get(user_id)?.add(ws);
}

export function removeTunnel(user_id: string, ws: UserWebSocketData) {
    const tunnel = userWebSocketTunnels.get(user_id);
    if (tunnel) {
        tunnel.delete(ws);
        if (tunnel.size === 0) userWebSocketTunnels.delete(user_id);
    }
}

export function broadcast(eventType: string, data: any) {
    const payload = JSON.stringify({ type: eventType, data });

    for (const userWebSocketTunnel of userWebSocketTunnels.values()) {
        for (const ws of userWebSocketTunnel) {
            if (ws.readyState === 1) ws.send(payload);
        }
    }
}
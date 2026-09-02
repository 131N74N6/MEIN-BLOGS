import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userChatController from "./controller";
import { getChatRoomId, TUserChat, userChatSchema } from "./model";
import { authService } from "../auth/service";
import userChatService from "./service";
import { BlogApiError } from "../error/handler";

const userChatRouters = new Elysia({ prefix: "/api/chats" })
.use(authMiddleware)
.delete("/clear-all", async ({ query, user }) => {
    return await userChatController.clearAllMessages({ receiver_id: query.receiver_id, sender_id: user.id });
}, {
    query: t.Omit(userChatSchema.delete_chat, ["message_ids"])
})
.delete("/clear-chosen", async ({ body, user }) => {
    return await userChatController.clearChosenMessages({ sender_id: user.id, ...body });
}, {
    body: t.Omit(userChatSchema.delete_chat, ["sender_id"])
})
.delete("/rm-all", async ({ query, user }) => {
    return await userChatController.deleteAllMessages({ receiver_id: query.receiver_id, sender_id: user.id });
}, {
    query: t.Omit(userChatSchema.delete_chat, ["message_ids"])
})
.delete("/rm-chosen", async ({ body, user }) => {
    return await userChatController.deleteChosenMessages({ sender_id: user.id, ...body });
}, {
    body: t.Omit(userChatSchema.delete_chat, ["sender_id"])
})
.get("/show", async ({ query, user }) => {
    return await userChatController.getAllMessages({ sender_id: user.id, ...query });
}, {
    query: t.Omit(userChatSchema.pagination, ["sender_id"])
})
.post("/send", async ({ body, user }) => {
    return await userChatController.sendMessage({ sender_id: user.id, ...body });
}, {
    body: t.Omit(userChatSchema.add_raw, ["sender_id"])
})
.put("/remake", async ({ body }) => {
    return await userChatController.changeMessage(body);
}, {
    body: userChatSchema.change_result
})
.ws("/ws", {
    // 1. Saat Koneksi Terbuka
    open: async (ws) => {
        try {
            // Validasi session dari cookie/header yang dibawa saat handshake WS
            const session = await authService.api.getSession({ 
                headers: ws.data.headers 
            });

            if (!session) {
                ws.close(1008, "Unauthorized: Invalid or missing session");
                return;
            }

            // Simpan data user di instance WebSocket
            ws.data.user = session.user;
            ws.data.user.id = session.user.id;
            
            console.log(`✅ User ${session.user.id} connected to chat WS`);
        } catch (error) {
            ws.close(1011, "Internal Server Error during auth");
        }
    },

    // 2. Saat Menerima Pesan dari Client
    message: async (ws, message) => {
        const userId = ws.data.user.id;
        
        try {
            // Parse dan validasi format pesan dasar
            const parsed = JSON.parse(message as string);
            
            // Validasi schema dasar
            if (!parsed.type || !parsed.payload) {
                ws.send(JSON.stringify({ type: "ERROR", message: "Invalid message format" }));
                return;
            }

            switch (parsed.type) {
                case "JOIN": {
                    // Client meminta untuk bergabung ke room percakapan tertentu
                    const targetUserId = parsed.payload.targetUserId;
                    if (!targetUserId) break;
                    
                    const roomId = getChatRoomId(userId, targetUserId);
                    ws.subscribe(roomId);
                    console.log(`User ${userId} joined room ${roomId}`);
                    break;
                }

                case "SEND": {
                    const payload = parsed.payload as TUserChat["add_raw"];
                    if (payload.sender_id !== userId) {
                        throw new BlogApiError(403, "Forbidden: You can only send as yourself");
                    }

                    // Simpan ke DB
                    const newMessage = await userChatService.sendMessage(payload);
                    
                    // Broadcast ke room
                    const roomId = getChatRoomId(payload.sender_id, payload.receiver_id);
                    ws.publish(roomId, JSON.stringify({ type: "MESSAGE_SENT", data: newMessage }));
                    break;
                }

                case "EDIT": {
                    const payload = parsed.payload as TUserChat["change_result"];
                    
                    // Validasi kepemilikan pesan (opsional tapi disarankan: cek dulu di DB apakah sender_id == userId)
                    const updatedMessage = await userChatService.changeMessage(payload);
                    
                    if (updatedMessage) {
                        const roomId = getChatRoomId(updatedMessage.sender_id.toString(), updatedMessage.receiver_id.toString());
                        ws.publish(roomId, JSON.stringify({ type: "MESSAGE_EDITED", data: updatedMessage }));
                    }
                    break;
                }

                case "DELETE_CHOSEN": {
                    const payload = parsed.payload as TUserChat["delete_chat"];
                    if (payload.sender_id !== userId) throw new BlogApiError(403, "Forbidden");

                    await userChatService.deleteChosenMessages(payload);
                    
                    const roomId = getChatRoomId(payload.sender_id, payload.receiver_id);
                    ws.publish(roomId, JSON.stringify({
                        type: "MESSAGES_DELETED",
                        data: { message_ids: payload.message_ids }
                    }));
                    break;
                }

                case "DELETE_ALL": {
                    const payload = parsed.payload as Omit<TUserChat["delete_chat"], "message_ids">;
                    if (payload.sender_id !== userId) throw new BlogApiError(403, "Forbidden");

                    await userChatService.deleteAllMessages(payload);
                    
                    const roomId = getChatRoomId(payload.sender_id, payload.receiver_id);
                    ws.publish(roomId, JSON.stringify({
                        type: "ALL_MESSAGES_DELETED",
                        data: { receiver_id: payload.receiver_id, sender_id: payload.sender_id }
                    }));
                    break;
                }

                default:
                    ws.send(JSON.stringify({ type: "ERROR", message: "Unknown action type" }));
            }
        } catch (error) {
            console.error("WS Error:", error);
            const errorMsg = error instanceof BlogApiError ? error.message : "Internal WS Error";
            ws.send(JSON.stringify({ type: "ERROR", message: errorMsg }));
        }
    },

    // 3. Saat Koneksi Ditutup
    close: (ws) => {
        console.log(`❌ User ${ws.data.user.id} disconnected from chat WS`);
    },

    // Validasi payload WebSocket (Opsional tapi Best Practice)
    body: userChatSchema.ws_message
});

export default userChatRouters;
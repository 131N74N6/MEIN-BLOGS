import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userChatController from "./controller";
import { ChatWSData, TUserChat, userChatSchema, UserMessage } from "./model";
import { authService } from "../auth/service";
import userChatService from "./service";
import { BlogApiError } from "../error/service";

const userChatRouters = new Elysia({ prefix: "/api/chats" })
.use(authMiddleware)
.delete("/clear-all/:receiver_id", async ({ params, user }) => {
    return await userChatController.clearAllMessages({ receiver_id: params.receiver_id, sender_id: user.id });
}, {
    params: t.Pick(userChatSchema.delete_chat, ["receiver_id"])
})
.delete("/clear-chosen", async ({ body, user }) => {
    return await userChatController.clearChosenMessages({ sender_id: user.id, ...body });
}, {
    body: t.Omit(userChatSchema.delete_chat, ["sender_id"])
})
.delete("/rm-all/:receiver_id", async ({ params, user }) => {
    return await userChatController.deleteAllMessages({ receiver_id: params.receiver_id, sender_id: user.id });
}, {
    params: t.Pick(userChatSchema.delete_chat, ["receiver_id"])
})
.delete("/rm-chosen", async ({ body, user }) => {
    return await userChatController.deleteChosenMessages({ sender_id: user.id, ...body });
}, {
    body: t.Omit(userChatSchema.delete_chat, ["sender_id"])
})
.get("/show", async ({ query, user }) => {
    return await userChatController.getAllMessages({ sender_id: user.id, ...query });
}, {
    query: t.Omit(userChatSchema.pagination, ["sender_id", "skip"])
})
.post("/send", async ({ body, user }) => {
    return await userChatController.sendMessage({ sender_id: user.id, ...body });
}, {
    body: t.Omit(userChatSchema.add_raw, ["sender_id"])
})
.put("/remake", async ({ body, user }) => {
    return await userChatController.changeMessage({ ...body, sender_id: user.id });
}, {
    body: t.Omit(userChatSchema.change_result, ["sender_id"])
})
.ws("/ws", {
    open: async (ws) => {
        try {
            const rawHeaders = ws.data.headers;
            const headersInit: Record<string, string> = {};

            for (const key in rawHeaders) {
                if (rawHeaders[key] !== null && rawHeaders[key] !== undefined) {
                    headersInit[key] = rawHeaders[key] as string;
                }
            }

            const headers = new Headers(headersInit);
            const session = await authService.api.getSession({ headers });

            if (!session) {
                ws.close(1008, "Unauthorized: Invalid or missing session");
                return;
            }

            const data = ws.data as ChatWSData;
            data.user = session.user;
            data.userId = session.user.id; 
            
            console.log(`✅ User ${session.user.id} connected to chat WS`);
        } catch (error) {
            console.error("WS Open Error:", error);
            ws.close(1011, "Internal Server Error during auth");
        }
    },

    message: async (ws, body) => {
        const data = ws.data as ChatWSData;
        const userId = data.userId;

        const getChatRoomId = (id1: string, id2: string) => {
            const sorted = [id1, id2].sort();
            return `chat_${sorted[0]}_${sorted[1]}`;
        }
        
        if (!userId) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized" }));
            return;
        }

        try {
            const parsed = body;
            
            if (!parsed.type || !parsed.payload) {
                ws.send(JSON.stringify({ type: "ERROR", message: "Invalid message format" }));
                return;
            }

            switch (parsed.type) {
                case "ping": {
                    ws.send(JSON.stringify({ type: "pong", payload: {} }));
                }
                case "JOIN": {
                    const targetUserId = parsed.payload.targetUserId as string;
                    if (!targetUserId) break;

                    const roomId = getChatRoomId(userId, targetUserId);
                    ws.subscribe(roomId);
                    console.log(`🔔 User ${userId} joined room ${roomId}`);
                    break;
                }
                case "SEND_FILE": {
                    const newMessage = parsed.payload as UserMessage;
                    if (newMessage.sender_id !== userId) throw new BlogApiError(403, "Forbidden");

                    const roomId = getChatRoomId(newMessage.sender_id, newMessage.receiver_id);
                    ws.publish(roomId, JSON.stringify({ type: "MESSAGE_SENT", payload: newMessage }));
                    break;
                }
                case "SEND_TEXT": {
                    const payload = parsed.payload as TUserChat["add_raw"];
                    if (payload.sender_id !== userId) throw new BlogApiError(403, "Forbidden");

                    const newMessage = await userChatService.sendMessage(payload);
                    const roomId = getChatRoomId(payload.sender_id, payload.receiver_id);
                    ws.publish(roomId, JSON.stringify({ type: "MESSAGE_SENT", payload: newMessage }));
                    break;
                }
                case "EDIT": {
                    const payload = parsed.payload as TUserChat["change_result"];
                    if (payload.sender_id !== userId) throw new BlogApiError(403, "Forbidden");

                    const updatedMessage = await userChatService.changeMessage(payload);
                    if (updatedMessage) {
                        const senderId = updatedMessage.sender_id.toString();
                        const receiverId = updatedMessage.receiver_id.toString();

                        const roomId = getChatRoomId(senderId, receiverId);
                        ws.publish(roomId, JSON.stringify({ 
                            type: "MESSAGE_EDITED", 
                            payload: updatedMessage 
                        }));
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
                        payload: { message_ids: payload.message_ids } 
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
                        payload: { receiver_id: payload.receiver_id, sender_id: payload.sender_id } 
                    }));
                    break;
                }
                default: { 
                    ws.send(JSON.stringify({ type: "ERROR", payload: { message: "Unknown action type" } })); 
                }
            }
        } catch (error) {
            console.error("WS Message Error:", error);
            const errorMsg = error instanceof BlogApiError ? error.message : "something went wrong";
            ws.send(JSON.stringify({ type: "ERROR", payload: { message: errorMsg } }));
        }
    },

    close: (ws) => {
        const data = ws.data as ChatWSData;
        console.log(`❌ User ${data.userId || 'Unknown'} disconnected from chat WS`);
    },

    body: userChatSchema.ws_message 
});

export default userChatRouters;
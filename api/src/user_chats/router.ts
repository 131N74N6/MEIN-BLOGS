import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userChatController from "./controller";
import { userChatSchema } from "./model";
import { userChatsEvents } from "./event";
import { validateSessionFromToken } from "../auth/service";

const wsContext = new WeakMap<any, { roomId: string; handler: (payload: any) => void }>();

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
.get("/media/show", async ({ query }) => {
    return await userChatController.getChosenMessageFiles(query._id);
}, {
    query: t.Pick(userChatSchema.change_result, ["_id"])
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
.ws("/ws/:receiver_id", {
    query: t.Object({
        token: t.String({ minLength: 1, error: "invalid token" })
    }),

    async open(ws) {
        try {
            const token = ws.data.query.token; 
            const receiverId = ws.data.params.receiver_id;
            const session = await validateSessionFromToken(token);

            if (!session || !session.user) {
                console.error("❎ WebSocket: invalid or token expired");
                ws.send(JSON.stringify({ type: "error", message: "Unauthorized" }));
                ws.close(4001, "Unauthorized");
                return;
            }

            const userId = session.user.id;

            if (!userId || !receiverId) {
                console.error("❎ WebSocket: Missing userId or receiverId");
                ws.send(JSON.stringify({ type: "error", message: "Missing parameters" }));
                ws.close(4002, "Missing parameters");
                return;
            }

            const roomId = [userId, receiverId].sort().join("_");
            
            const handler = (payload: any) => {
                try {
                    ws.send(JSON.stringify(payload));
                } catch (error) {
                    console.error("Error sending WebSocket message:", error);
                }
            }
            
            userChatsEvents.on(roomId, handler);
            wsContext.set(ws, { roomId, handler });

            ws.send(JSON.stringify({ 
                type: "connected", 
                roomId,
                userId,
                message: "WebSocket connection established"
            }));
                
            console.log(`✅ WebSocket connected: ${userId} joined room ${roomId}`);
        } catch (error) {
            console.error(" WebSocket open error:", error);
            ws.send(JSON.stringify({ type: "error", message: "Connection failed" }));
            ws.close(4003, "Internal error");
        }
    },

    close(ws) {
        const ctx = wsContext.get(ws);
        if (ctx) {
            userChatsEvents.off(ctx.roomId, ctx.handler);
            wsContext.delete(ws);
            console.log(`📶 WebSocket disconnected from room ${ctx.roomId}`);
        }
    }
});

export default userChatRouters;
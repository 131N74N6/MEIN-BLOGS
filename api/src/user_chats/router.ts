import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userChatController from "./controller";
import { userChatSchema } from "./model";

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
    open(ws) {
        const userId = ws.data.headers["x-user-id"];
    },
});

export default userChatRouters;
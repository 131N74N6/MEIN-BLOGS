import Elysia from "elysia";
import { authMiddleware } from "../auth/middleware";
import { websocket } from "elysia/ws";

const userChatRouters = new Elysia({ prefix: "/api/chats" })
.use(authMiddleware)
.use(websocket());

export default userChatRouters;
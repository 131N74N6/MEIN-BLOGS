import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userController from "./controller";
import { userSchema } from "./model";
import { addTunnel, removeTunnel } from "./websocket";
import { validateSessionFromToken } from "../auth/service";

const userRouters = new Elysia({ prefix: "/api/users" })
.use(authMiddleware)
.delete("/rm", async ({ user }) => {
    return await userController.deleteUser(user.id);
})
.delete("/rm/profile-picture", async ({ user }) => {
    return await userController.deleteOldProfile(user.id);
})
.get("/show/me", async ({ user }) => {
    return await userController.getCurrentUser(user.id);
})
.get("/show/:user_id", async ({ params }) => {
    return await userController.getCurrentUser(params.user_id);
}, {
    params: userSchema.other_user
})
.get("/session", async ({ cookie }) => {
    const sessionToken = cookie['better-auth.session_token']?.value;
    return { data: sessionToken || null, success: true, message: "Session retrieved successfully" };
})
.put("/remake", async ({ body, user }) => {
    return await userController.changeUser({ id: user.id, ...body });
}, {
    body: t.Pick(userSchema.change_raw, ["description", "image", "name"])
})
.ws("/ws", {
    query: userSchema.ws_config,

    async open(ws) {
        try {
            const token = ws.data.query.token; 
            const session = await validateSessionFromToken(token);

            if (!session || !session.user) {
                ws.send(JSON.stringify({ type: "error", message: "You are not allowed to access" }));
                ws.close(4001, "You are not allowed to access");
                return;
            }

            const userId = session.user.id;

            if (!userId || typeof userId !== "string") {
                ws.send(JSON.stringify({ type: "error", message: "Invalid user" }));
                ws.close(4002, "Invalid user");
                return;
            }
            
            if (userId) addTunnel(userId, ws);
        } catch (error) {
            ws.send(JSON.stringify({ type: "error", message: "Connection failed" }));
            ws.close(4003, "Internal error");
        }
    },

    message(ws, message) {
        const data = JSON.parse(message as string);
        if (data.type === "ping") ws.send(JSON.stringify({ type: "pong" }));
    },

    close(ws) {
        const userId = ws.data.user.id;
        if (userId) removeTunnel(userId, ws);
    }
});

export default userRouters;
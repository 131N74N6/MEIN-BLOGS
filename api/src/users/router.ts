import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userController from "./controller";
import { userSchema } from "./model";
import { addTunnel, removeTunnel } from "./websocket";

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
    params: userSchema["other_user"]
})
.get("/session", async ({ cookie }) => {
    const sessionToken = cookie['better-auth.session_token']?.value;
    return { data: sessionToken || null, success: true, message: "Session retrieved successfully" };
})
.put("/remake", async ({ body, user }) => {
    return await userController.changeUser({ id: user.id, ...body });
}, {
    body: t.Pick(userSchema["change_raw"], ["description", "image", "name"])
})
.ws("/ws", {
    open(ws) {
        const userId = ws.data.user.id;
        if (userId) addTunnel(userId, ws);
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
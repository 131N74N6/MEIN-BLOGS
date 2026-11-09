import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userController from "./controller";
import { userSchema } from "./model";
import { authService } from "../auth/service";
import { userSSE } from "./event";

const userRouters = new Elysia({ prefix: "/api/users" })
.use(authMiddleware)
.delete("/rm", async ({ user }) => {
    return await userController.deleteUser(user.id)
})
.delete("/rm/profile-picture", async ({ user }) => {
    return await userController.deleteOldProfile(user.id)
})
.get("/show/:user_id", async ({ params }) => {
    return await userController.getCurrentUser(params.user_id);
}, {
    params: userSchema["other_user"]
})
.get("/sse", async ({ cookie }) => {
    const sessionToken = cookie?.session_token?.value;
    if (!sessionToken) return;

    const headers = new Headers();
    headers.set("cookie", `better-auth.session_token=${sessionToken}`);

    const session = await authService.api.getSession({ headers });
    if (!session) return;

    const userId = session.user.id;
    if (!userId || typeof userId !== "string") return;

    const stream = new ReadableStream({
        start(controller) {
            userSSE.set(userId, controller);
            controller.enqueue(`data: ${JSON.stringify({ type: "Connected", userId })}\n\n`);
        },
        cancel() {
            userSSE.delete(userId);
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    });
})
.get("/session", async ({ cookie }) => {
    const sessionToken = cookie['better-auth.session_token']?.value;
    return { data: sessionToken || null, success: true, message: "Session retrieved successfully" };
})
.put("/remake", async ({ body, user }) => {
    return await userController.changeUser({ id: user.id, ...body });
}, {
    body: t.Pick(userSchema["change_raw"], ["description", "image", "name"])
});

export default userRouters;
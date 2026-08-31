import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userController from "./controller";
import { userSchema } from "./model";

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
.put("/remake", async ({ body, user }) => {
    return await userController.changeUser({ id: user.id, ...body });
}, {
    body: t.Pick(userSchema["change_raw"], ["description", "image", "name"])
});

export default userRouters;
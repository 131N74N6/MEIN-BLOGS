import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userController from "./controller";
import { userSchema } from "./model";

const userRouters = new Elysia({ prefix: "/api/users" })
.use(authMiddleware)
.delete("/rm", async ({ user }) => await userController.deleteUser(user.id))
.delete("/rm/profile-picture", async ({ user }) => await userController.deleteOldProfile(user.id))
.get("/show/:user_id", async ({ params }) => {
    return await userController.getCurrentUser(params.user_id);
}, {
    params: userSchema["other_user"]
})
.put("/remake", async ({ body, user }) => await userController.changeUser({
    id: user.id, ...body
}), {
    body: t.Omit(userSchema["change_raw"], ["id"])
});

export default userRouters;
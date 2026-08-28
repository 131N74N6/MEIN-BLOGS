import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userController from "./controller";
import { userSchema } from "./model";

const userRouters = new Elysia({ prefix: "/api/users" })
.use(authMiddleware)
.delete("/", async ({ user }) => await userController.deleteUser(user.id))
.delete("/profile-picture", async ({ user }) => await userController.deleteOldProfile(user.id))
.get("/:user_id", async ({ params }) => {
    return await userController.getOthertUser(params.user_id);
}, {
    params: userSchema["other_user"]
})
.put("/", async ({ body, user }) => await userController.changeUser({
    id: user.id, ...body
}), {
    body: t.Omit(userSchema["change_raw"], ["id"])
});

export default userRouters;
import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import userController from "./controller";
import { userSchema } from "./model";

const userRouters = new Elysia({ prefix: "/api/users" })
.use(authMiddleware())
.delete("/", async ({ user }) => await userController.deleteUser(user.id))
.delete("/profile", async ({ user }) => await userController.deleteOldProfile(user.id))
.get("/", async ({ user }) => await userController.getCurrentUser(user.id))
.put("/", async ({ body, user }) => await userController.changeUser({
    id: user.id, description: body.description, image: body.image, name: body.name
}), {
    body: t.Omit(userSchema["change_raw"], ["id"])
});

export default userRouters;
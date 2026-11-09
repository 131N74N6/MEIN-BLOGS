import Elysia from "elysia";
import { jwtPlugin } from "./jwt";
import authController from "./controller";
import { authSchema } from "./model";

const authRouters = new Elysia({ prefix: "/api/blogs" })
.use(jwtPlugin)
.post("/sign-in", async ({ body, jwt, cookie }) => {
    const jwtCookie = cookie.jwt_auth_token;
    return await authController.signin(jwtCookie, jwt.sign, body);
}, {
    body: authSchema["sign_in"]
})
.post("/sign-up", async ({ body, jwt, cookie }) => {
    const jwtCookie = cookie.jwt_auth_token;
    return await authController.signin(jwtCookie, jwt.sign, body);
}, {
    body: authSchema["sign_up"]
})
.post("/sign-out", async ({ cookie }) => {
    return await authController.signOut(cookie.jwt_auth_token);
});

export default authRouters;
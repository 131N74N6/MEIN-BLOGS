import { Elysia } from "elysia";
import { BlogApiError } from "../error/service";
import { jwtPlugin } from "./jwt";
import { TAuths } from "./model";

export const authMiddleware = new Elysia({ name: "auth-middleware" })
    .use(jwtPlugin)
    .cookie(TAuth["cookie"]) 
    .derive(async ({ cookie, jwt, set }) => {
        const currentToken = cookie['jwt_auth_token']?.value;

        if (!currentToken) {
            set.status = 401;
            throw new BlogApiError(401, "unauthorized");
        }

        const user = (await jwt.verify(currentToken)) as TAuths["jwt_payload"] | false;

        if (!user || typeof user._id !== "string") {
            set.status = 401;
            throw new BlogApiError(401, "invalid or expired token");
        }

        return { user };
    });
}
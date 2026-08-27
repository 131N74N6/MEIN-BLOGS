import { Elysia } from "elysia";
import { authService } from "./service";
import { BlogApiError } from "../error/message";

export const authMiddleware = (app: Elysia) => {
    return app.derive(async ({ request }) => {
        const session = await authService.api.getSession({
            headers: request.headers
        });

        if (!session) throw new BlogApiError(401, 'Unauthorized');
        console.log("✅ User authenticated:", session.user.id);
        return { user: session.user };
    });
}
import { Elysia } from "elysia";
import { authService } from "./service";
import { BlogApiError } from "../error/handler";

export const authMiddleware = (app: Elysia) => {
    return app.derive(async ({ request }) => {
        const session = await authService.api.getSession({
            headers: request.headers
        });

        if (!session) throw new BlogApiError(401, 'Unauthorized');
        return { user: session.user };
    });
}
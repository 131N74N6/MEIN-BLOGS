import { Elysia } from "elysia";
import { authService } from "./service";

export const authMiddleware = () => (app: Elysia) => {
    return app.derive(async ({ request }) => {
        const session = await authService.api.getSession({
            headers: request.headers
        });

        if (!session) throw new Error('Unauthorized');
        
        return { user: session.user };
    });
}
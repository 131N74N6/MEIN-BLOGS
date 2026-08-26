import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { authService } from "./auth/service";
import blogRouters from "./blogs/router";
import commentRouters from "./comments/router";
import relationsRouters from "./relations/router";
import viewerRouters from "./viewers/router";
import userRouters from "./users/router";
import { setupErrorHandler } from "./error/handler";
import { BlogApiError } from "./error/message";

const port = import.meta.env.PORT || 3000;

// Simple Rate Limiter Map (In-Memory)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // Max request
const DURATION = 15 * 60 * 1000; // 15 Menit

const app = new Elysia()
.use(cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:3000"]
}))
.use(setupErrorHandler)
// .onRequest(({ request, set }) => {
//     const clientIP = request.headers.get("x-forwarded-for") || "local-client";
//     const now = Date.now();
//     const clientData = requestCounts.get(clientIP);

//     if (!clientData || now > clientData.resetTime) {
//         requestCounts.set(clientIP, { count: 1, resetTime: now + DURATION });
//         return;
//     }

//     if (clientData.count >= RATE_LIMIT) {
//         set.status = 429;
//         throw new BlogApiError(429, "Too many request attempts, try again later.");
//     }

//     clientData.count++;
// })
.all("/api/auth/*", async (ctx) => { return await authService.handler(ctx.request); })
.use(blogRouters)
.use(commentRouters)
.use(relationsRouters)
.use(viewerRouters)
.use(userRouters)
.get("/", () => "Hello Elysia");

app.listen(port, () => console.log(`🦊 Elysia is running at http://localhost:${port}`));

export default app;
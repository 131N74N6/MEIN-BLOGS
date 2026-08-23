import { Elysia } from "elysia";
import { dbConnect } from "./mongodb/service";
import { authService } from "./auth/service";
import blogRouters from "./blogs/router";
import commentRouters from "./comments/router";
import relationsRouters from "./relations/router";
import cors from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";
import viewerRouters from "./viewers/router";
import userRouters from "./users/router";
import { setupErrorHandler } from "./error/handler";

const port = import.meta.env.PORT || 3000;

const app = new Elysia()
.use(cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:3000"]
}))
.use(rateLimit({
    duration: 900000, // 15 min
    max: 30,
    errorResponse: "Too many request attempts try again later.",
}))
.all("/api/auth/*", async (ctx) => { return await authService.handler(ctx.request); })
.onError(setupErrorHandler)
.use(blogRouters)
.use(commentRouters)
.use(relationsRouters)
.use(viewerRouters)
.use(userRouters)
.get("/", () => "Hello Elysia");

dbConnect().then(() => {
    app.listen(port, () => console.log("🦊 Elysia is running at http://localhost:3000"));
});

export default app;
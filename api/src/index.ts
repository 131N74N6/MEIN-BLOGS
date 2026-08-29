import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { authService } from "./auth/service";
import blogRouters from "./blogs/router";
import commentRouters from "./comments/router";
import relationsRouters from "./relations/router";
import viewerRouters from "./viewers/router";
import userRouters from "./users/router";
import { setupErrorHandler } from "./error/handler";
import { v2 } from "cloudinary";

const port = import.meta.env.PORT || 3000;

v2.config({
    api_key: import.meta.env.CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
    cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME
});

const app = new Elysia()
.use(setupErrorHandler)
.use(cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:3000"]
}))
.all("/api/auth/*", async (ctx) => { return await authService.handler(ctx.request); })
.use(blogRouters)
.use(commentRouters)
.use(relationsRouters)
.use(viewerRouters)
.use(userRouters)
.get("/", () => "Hello, this is Elysia")
.get("/api", () => "Elysia API is ready");

app.listen(port, () => console.log(`🦊 Elysia is running at http://localhost:${port}`));

export default app;
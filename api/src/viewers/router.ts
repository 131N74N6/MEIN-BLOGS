import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import viewerController from "./controller";
import { viewerSchema } from "./model";

const viewerRouters = new Elysia({ prefix: "/api/viewers"})
.use(authMiddleware)
.get("/show/:blog_id", async ({ params, query }) => {
    return await viewerController.getAllBlogViewers({
        blog_id: params.blog_id, page: query.page, limit: query.limit
    })
}, {
    params: viewerSchema.params,
    query: t.Omit(viewerSchema.pagination, ["blog_id", "skip"])
})
.get("/show/total/:blog_id", async ({ params }) => {
    return await viewerController.getAllBlogViewersTotal({ blog_id: params.blog_id });
}, {
    params: viewerSchema.params
})
.post("/see/:blog_id", async ({ params, user }) => await viewerController.seeOneBlog({
    blog_id: params.blog_id, user_id: user.id
}), {
    params: viewerSchema.params
});

export default viewerRouters;
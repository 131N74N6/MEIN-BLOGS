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
    params: t.Pick(viewerSchema.params, ["blog_id"]),
    query: t.Omit(viewerSchema.pagination, ["blog_id", "skip"])
})
.get("/show/total/:blog_id", async ({ params }) => {
    return await viewerController.getAllBlogViewersTotal({ blog_id: params.blog_id });
}, {
    params: t.Pick(viewerSchema.params, ["blog_id"])
})
.get("/users/show/total/:blog_owner_id", async ({ params }) => {
    return await viewerController.getReceivedBlogViewersTotalForCurrentUser(params.blog_owner_id);
}, {
    params: t.Pick(viewerSchema.params, ["blog_owner_id"])
})
.post("/start-see", async ({ body, user }) => {
    return await viewerController.seeOneBlog({ ...body, user_id: user.id });
}, {
    body: viewerSchema.params
});

export default viewerRouters;
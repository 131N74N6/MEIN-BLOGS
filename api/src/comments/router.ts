import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import commentController from "./controller";
import { commentSchema } from "./model";

const commentRouters = new Elysia({ prefix: "/api/comments" })
.use(authMiddleware)
.get("/show/:blog_id", async ({ params, query }) => {
    return await commentController.getAllCommentsInOneBlog({
        blog_id: params.blog_id, page: query.page, limit: query.limit
    })
}, {
    params: commentSchema.params,
    query: t.Omit(commentSchema.pagination, ["blog_id", "skip"])
})
.get("/show/:blog_id/total", async ({ params }) => {
    return await commentController.getCommentsTotalInOneBlog(params.blog_id)
}, {
    params: commentSchema.params
})
.post("/create/:blog_id", async ({ body, user, params }) => await commentController.createComment({
    blog_id: params.blog_id, user_id: user.id, ...body
}), {
    body: t.Omit(commentSchema.add, ["created_at", "blog_id", "user_id", "username"]),
    params: commentSchema.params
});

export default commentRouters;
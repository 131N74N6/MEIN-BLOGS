import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import commentController from "./controller";
import { commentSchema } from "./model";

const commentRouters = new Elysia({ prefix: "/api/comments" })
.use(authMiddleware())
.get("/:blog_id", async ({ params: { blog_id }, query }) => await commentController.getAllCommentsInOneBlog({
    blog_id: blog_id, page: query.page, limit: query.limit
}), {
    params: commentSchema.params,
    query: t.Omit(commentSchema.pagination, ["skip"])
})
.get("/:blog_id/total", async ({ params: { blog_id }}) => await commentController.getCommentsTotalInOneBlog(blog_id), {
    params: commentSchema.params
})
.post("/:blog_id", async ({ body, user, params }) => await commentController.createComment({
    blog_id: params.blog_id,
    blog_owner_id: body.blog_owner_id,
    user_id: user.id,
    text: body.text
}), {
    body: t.Omit(commentSchema.add, ["created_at", "username"]),
    params: commentSchema.params
});

export default commentRouters;
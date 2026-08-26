import Elysia, { t } from "elysia";
import blogController from "./controller";
import { blogSchema } from "./model";
import { authMiddleware } from "../auth/middleware";

const blogRouters = new Elysia({ prefix: "/api/blogs" })
.use(authMiddleware)
.delete("/", async ({ user }) => await blogController.deleteAllBlogs(user.id))
.delete("/bulk", async({ body, user }) => {
    return await blogController.deleteChosenBlogs(body.blogs_ids, user.id);
}, {
    body: blogSchema.bulkDelete
})
.get("/", async ({ query }) => {
    return await blogController.getAllBlogs({
        limit: query.limit, page: query.page
    });
}, {
    query: t.Omit(blogSchema.pagination, ["skip", "blog_owner_id"])
})
.get("/:_id", async ({ params }) => {
    return await blogController.getBlogContentById(params._id);
}, {
    params: t.Pick(blogSchema.params, ["_id"])
})
.get("/user/:user_id", async ({ params, query }) => {
    return await blogController.getAllUserBlogs({
        page: query.page, limit: query.limit, blog_owner_id: params.user_id
    });
}, {
    params: t.Pick(blogSchema.params, ["user_id"]),
    query: t.Omit(blogSchema.pagination, ["skip", "blog_owner_id"])
})
.post("/", async ({ body, user }) => await blogController.createNewBlog({
    blog_owner_id: user.id,
    content: body.content,
    language: body.language,
    media: body.media,
    title: body.title
}), {
    body: blogSchema.add_raw
})
.post("/generate", async ({ body }) => {
    return await blogController.generateNewBlog({
        language: body.language, title: body.title
    });
}, {
    body: blogSchema.generate
})
.put("/:_id", async ({ body, params, user }) => await blogController.changeOneBlog({
    _id: params._id,
    blog_owner_id: user.id,
    content: body.content,
    language: body.language,
    media: body.media,
    title: body.title
}), {
    body: t.Omit(blogSchema.change_raw, ["_id"]),
    params: t.Pick(blogSchema.params, ["_id"])
});

export default blogRouters;
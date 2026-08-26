import Elysia, { t } from "elysia";
import blogController from "./controller";
import { blogSchema } from "./model";
import { authMiddleware } from "../auth/middleware";

const blogRouters = new Elysia({ prefix: "/api/blogs"})
.use(authMiddleware)
.delete("/", async ({ user }) => await blogController.deleteAllBlogs(user.id))
.delete("/bulk", async({ body, user }) => await blogController.deleteChosenBlogs(body.blogs_ids, user.id), {
    body: t.Object({ blogs_ids: t.Array(t.String()) })
})
.get("/", async ({ query }) => {
    return await blogController.getAllBlogs(query);
}, {
    query: t.Omit(blogSchema.pagination, ["skip", "blog_owner_id"])
})
.get("/mine", async ({ query, user }) => {
    return await blogController.getAllUserBlogs({
        page: query.page, limit: query.limit, blog_owner_id: user.id
    });
}, {
    query: t.Omit(blogSchema.pagination, ["skip", "blog_owner_id"])
})
.get("/:_id", async ({ params }) => {
    return await blogController.getBlogContentById(params._id);
}, {
    params: blogSchema.params
})
.post("/", async ({ body, user }) => await blogController.createNewBlog({
    blog_owner_id: user.id,
    content: body.content,
    language: body.language,
    media: body.media,
    title: body.title
}), {
    body: t.Omit(blogSchema.add_raw, ["blog_owner_name", "blog_owner_profile_picture"])
})
.post("/generate", async ({ body }) => {
    return await blogController.generateNewBlog(body);
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
    body: blogSchema.change_raw,
    params: blogSchema.params
});

export default blogRouters;
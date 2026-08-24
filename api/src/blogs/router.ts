import Elysia, { t } from "elysia";
import blogController from "./controller";
import { blogSchema } from "./model";
import { authMiddleware } from "../auth/middleware";
import { ObjectId } from "mongodb";

const blogRouters = new Elysia({ prefix: "/api/blogs"})
.use(authMiddleware())
.delete("/", async ({ user }) => await blogController.deleteAllBlogs(user.id))
.delete("/bulk", async({ body, user }) => await blogController.deleteChosenBlogs(body.blogs_ids, user.id), {
    body: t.Object({ blogs_ids: t.Array(t.String()) })
})
.get("/", async ({ query }) => await blogController.getAllBlogs(query), {
    query: t.Omit(blogSchema.pagination, ["skip"])
})
.get("/mine", async ({ query, user }) => await blogController.getAllUserBlogs({
    page: query.page, limit: query.limit, blog_owner_id: new ObjectId(user.id)
}), {
    query: t.Omit(blogSchema.pagination, ["skip"])
})
.get("/:_id", async ({ params }) => await blogController.getBlogContentById(params._id), {
    params: blogSchema.params
})
.post("/", async ({ body, user }) => await blogController.createNewBlog({
    blog_owner_id: new ObjectId(user.id),
    content: body.content,
    language: body.language,
    media: body.media,
    title: body.title
}), {
    body: t.Omit(blogSchema.add_raw, ["blog_owner_name", "blog_owner_profile_picture"])
})
.post("/generate", async ({ body }) => await blogController.generateNewBlog(body), {
    body: blogSchema.generate
})
.put("/:_id", async ({ body, params: { _id } }) => await blogController.changeOneBlog({
    _id: new ObjectId(_id), 
    blog_owner_id: body.blog_owner_id,
    content: body.content,
    language: body.language,
    media: body.media,
    title: body.title
}), {
    body: blogSchema.change_raw,
    params: blogSchema.params
});

export default blogRouters;
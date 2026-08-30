import Elysia, { t } from "elysia";
import blogController from "./controller";
import { blogSchema } from "./model";
import { authMiddleware } from "../auth/middleware";

const blogRouters = new Elysia({ prefix: "/api/blogs" })
.use(authMiddleware)
.post("/create", async ({ body, user }) => await blogController.createNewBlog({
    blog_owner_id: user.id, ...body
}), {
    body: t.Omit(blogSchema.add_raw, ["blog_owner_id"])
})
.post("/generate", async ({ body }) => {
    return await blogController.generateNewBlog({
        language: body.language, title: body.title
    });
}, {
    body: blogSchema.generate
})
.delete("/rm-all", async ({ user }) => await blogController.deleteAllBlogs(user.id))
.delete("/rm-chosen", async({ body, user }) => {
    return await blogController.deleteChosenBlogs(body.blogs_ids, user.id);
}, {
    body: blogSchema.bulkDelete
})
.get("/show-all", async ({ query }) => {
    return await blogController.getAllBlogsWithPagination({
        limit: query.limit, page: query.page, title: query.title
    });
}, {
    query: t.Omit(blogSchema.pagination, ["skip", "blog_owner_id"])
})
.get("/show/:_id", async ({ params }) => {
    return await blogController.getBlogContentById(params._id);
}, {
    params: t.Pick(blogSchema.params, ["_id"])
})
.get("/user/:user_id", async ({ params, query }) => {
    return await blogController.getAllCurrentUserBlogsWithPagination({
        ...query, blog_owner_id: params.user_id
    });
}, {
    params: t.Pick(blogSchema.params, ["user_id"]),
    query: t.Omit(blogSchema.pagination, ["skip", "blog_owner_id"])
})
.get("/user/total/:user_id", async ({ params }) => {
    return await blogController.getAllCurrentUserBlogsTotal(params.user_id);
}, {
    params: t.Pick(blogSchema.params, ["user_id"])
})
.put("/remake/:_id", async ({ body, params, user }) => await blogController.changeOneBlog({
    _id: params._id, blog_owner_id: user.id, ...body
}), {
    body: t.Omit(blogSchema.change_raw, ["_id", "blog_owner_id"]),
    params: t.Pick(blogSchema.params, ["_id"]),
    type: "multipart/form-data"
});

export default blogRouters;
import { t, UnwrapSchema } from "elysia";

export const blogSchema = {
    add_raw: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid owner id" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.File({ maxSize: 6 * 1024 * 1024, type: "image/*", error: "invalid file" }),
        title: t.String({ minLength: 1, error: "invalid title"})
    }),
    add_result: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid owner id" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.Object({
            filename: t.String({ minLength: 1, error: "invalid filename"}),
            filetype: t.String({ minLength: 1, error: "invalid filetype"}),
            public_id: t.String({ minLength: 1, error: "invalid public id"}),
            resource_type: t.String({ minLength: 1, error: "invalid resource type"}),
            url: t.String({ minLength: 1, error: "invalid url"}),
        }),
        title: t.String({ minLength: 1, error: "invalid title"})
    }),
    change_raw: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid id" }),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid id" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.File({ maxSize: 6 * 1024 * 1024, type: "image/*", error: "invalid file" }),
        title: t.String({ minLength: 1, error: "invalid title"})
    }),
    change_result: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid id" }),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid id" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.Object({
            filename: t.String({ minLength: 1, error: "invalid filename"}),
            filetype: t.String({ minLength: 1, error: "invalid filetype"}),
            public_id: t.String({ minLength: 1, error: "invalid public id"}),
            resource_type: t.String({ minLength: 1, error: "invalid resource type"}),
            url: t.String({ minLength: 1, error: "invalid url"}),
        }),
        title: t.String({ minLength: 1, error: "invalid title"})
    }),
    bulkDelete: t.Object({
        blogs_ids: t.Array(t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog id" }))
    }),
    generate: t.Object({
        language: t.String({ minLength: 1, error: "invalid language"}),
        title: t.String({ minLength: 1, error: "invalid title"}),
    }),
    pagination: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid owner id" }),
        limit: t.Number({ maximum: 30, error: "Invalid data" }),
        page: t.Number({ default: 1, minimum: 1, error: "Invalid data" }),
        skip: t.Number({ maximum: 30, error: "Invalid data" }),
        title: t.Optional(t.String({ minLength: 1, error: "invalid title"})),
    }),
    params: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "Invalid id" }),
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "Invalid user id" })
    })
}

export type TBlogs = {
    [k in keyof typeof blogSchema]: UnwrapSchema<typeof blogSchema[k]>;
}
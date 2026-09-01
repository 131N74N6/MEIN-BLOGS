import { t, UnwrapSchema } from "elysia";

export const blogSchema = {
    add_raw: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.File({ maxSize: 6 * 1024 * 1024, type: "image/*", error: "invalid file" }),
        title: t.String({ minLength: 1, error: "invalid title" })
    }),
    add_result: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.Object({
            filename: t.String({ minLength: 1, error: "invalid file name" }),
            filetype: t.String({ minLength: 1, error: "invalid file type" }),
            public_id: t.String({ minLength: 1, error: "invalid public id" }),
            resource_type: t.String({ minLength: 1, error: "invalid resource type" }),
            url: t.String({ minLength: 1, error: "invalid url"}),
        }),
        title: t.String({ minLength: 1, error: "invalid title" })
    }),
    change_raw: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid or unsupported data" }),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid or unsupported data" }),
        content: t.Optional(t.String({ minLength: 1, error: "invalid content"})),
        language: t.Optional(t.String({ minLength: 1, error: "invalid language"})),
        media: t.Optional(t.File({ maxSize: 6 * 1024 * 1024, type: "image/*", error: "invalid file" })),
        title: t.Optional(t.String({ minLength: 1, error: "invalid title" }))
    }),
    change_result: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid or unsupported data" }),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid or unsupported data" }),
        content: t.Optional(t.String({ minLength: 1, error: "invalid content"})),
        language: t.Optional(t.String({ minLength: 1, error: "invalid language"})),
        media: t.Optional(t.Object({
            filename: t.String({ minLength: 1, error: "invalid file name" }),
            filetype: t.String({ minLength: 1, error: "invalid file type" }),
            public_id: t.String({ minLength: 1, error: "invalid public id" }),
            resource_type: t.String({ minLength: 1, error: "invalid resource type" }),
            url: t.String({ minLength: 1, error: "invalid url"}),
        })),
        title: t.Optional(t.String({ minLength: 1, error: "invalid title" }))
    }),
    bulkDelete: t.Object({
        blogs_ids: t.Array(t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid or unsupported data" }))
    }),
    generate: t.Object({
        language: t.String({ minLength: 1, error: "invalid language"}),
        title: t.String({ minLength: 1, error: "invalid title" }),
    }),
    pagination: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user" }),
        limit: t.Number({ maximum: 30, error: "invalid data" }),
        page: t.Number({ default: 1, minimum: 1, error: "invalid data" }),
        skip: t.Number({ maximum: 30, error: "invalid data" }),
        title: t.Optional(t.String({ minLength: 1, error: "invalid title"  })),
    }),
    params: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid or unsupported data" }),
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user" })
    })
}

export type TBlogs = {
    [k in keyof typeof blogSchema]: UnwrapSchema<typeof blogSchema[k]>;
}
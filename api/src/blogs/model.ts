import { t, UnwrapSchema } from "elysia";

export const blogSchema = {
    add_raw: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog owner" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.File({ maxSize: 6 * 1024 * 1024, type: "image/*", error: "unsupported file" }),
        title: t.String({ minLength: 1, error: "invalid title" })
    }),
    add_result: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog owner" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.Object({
            filename: t.String({ minLength: 1, error: "invalid file name" }),
            filetype: t.String({ minLength: 1, error: "invalid file type" }),
            public_id: t.String({ minLength: 1, error: "invalid file" }),
            resource_type: t.String({ minLength: 1, error: "failed to get file" }),
            url: t.String({ minLength: 1, error: "unable to access file" }),
        }),
        title: t.String({ minLength: 1, error: "invalid title" })
    }),
    change_raw: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog" }),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog owner" }),
        content: t.Optional(t.String({ minLength: 1, error: "invalid content"})),
        language: t.Optional(t.String({ minLength: 1, error: "invalid language"})),
        media: t.Optional(t.File({ maxSize: 6 * 1024 * 1024, type: "image/*", error: "unsupported file" })),
        title: t.Optional(t.String({ minLength: 1, error: "invalid title" }))
    }),
    change_result: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog" }),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog owner" }),
        content: t.Optional(t.String({ minLength: 1, error: "invalid content"})),
        language: t.Optional(t.String({ minLength: 1, error: "invalid language"})),
        media: t.Optional(t.Object({
            filename: t.String({ minLength: 1, error: "invalid file name" }),
            filetype: t.String({ minLength: 1, error: "invalid file type" }),
            public_id: t.String({ minLength: 1, error: "invalid file" }),
            resource_type: t.String({ minLength: 1, error: "failed to get file" }),
            url: t.String({ minLength: 1, error: "unable to access file"}),
        })),
        title: t.Optional(t.String({ minLength: 1, error: "invalid title" }))
    }),
    bulkDelete: t.Object({
        blogs_ids: t.Array(t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blogs" }))
    }),
    generate: t.Object({
        language: t.String({ minLength: 1, error: "invalid language"}),
        title: t.String({ minLength: 1, error: "invalid title" }),
    }),
    pagination: t.Object({
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog owner" }),
        limit: t.Number({ default: 16, maximum: 30, error: "maximum blog data each page is 30 and the minimum is 16" }),
        page: t.Number({ default: 1, minimum: 1, error: "minimum blog page is only 1" }),
        skip: t.Number({ default: 16, maximum: 30, error: "The maximum number of blogs data passed is 30 and the minimum is 16" }),
        title: t.Optional(t.String({ minLength: 1, error: "invalid title"  })),
    }),
    params: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog" }),
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user" })
    })
}

export type TBlogs = {
    [k in keyof typeof blogSchema]: UnwrapSchema<typeof blogSchema[k]>;
}
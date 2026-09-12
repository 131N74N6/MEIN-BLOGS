import { t, UnwrapSchema } from "elysia";

export const commentSchema = {
    add: t.Object({
        blog_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog"}),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog owner"}),
        text: t.String({ minLength: 1, error: "invalid comment"}),
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user"})
    }),
    pagination: t.Object({
        blog_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog"}),
        page: t.Number({ default: 1, minimum: 1, error: "minimum comment page is only 1" }),
        limit: t.Number({ default: 16, maximum: 30, error: "maximum comment each page is 30 and the minimum is 16" }),
        skip: t.Number({ default: 16, maximum: 30, error: "The maximum number of comments data passed is 30 and the minimum is 16" })
    }),
    params: t.Object({
        blog_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog" }),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog owner" })
    })
}

export type TComment = {
    [k in keyof typeof commentSchema]: UnwrapSchema<typeof commentSchema[k]>;
}
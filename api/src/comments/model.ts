import { t, UnwrapSchema } from "elysia";
import { ObjectId } from "mongodb";

export const commentSchema = {
    add: t.Object({
        blog_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        blog_owner_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        text: t.String({ minLength: 1, error: "invalid data"}),
        user_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data"})
    }),
    pagination: t.Object({
        blog_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        page: t.Number({ default: 1, minimum: 1, error: "invalid data" }),
        limit: t.Number({ default: 16, maximum: 30, error: "invalid data" }),
        skip: t.Number({ error: "invalid data"})
    }),
    params: t.Object({
        blog_id: t.String({ error: "invalid data" })
    })
}

export type TComment = {
    [k in keyof typeof commentSchema]: UnwrapSchema<typeof commentSchema[k]>;
}
import { t, UnwrapSchema } from "elysia";

export const relationSchema = {
    add: t.Object({
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user" }),
        followed_user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid followed user"})
    }),
    pagination: t.Object({
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user" }),
        followed_user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid followed user"}),
        page: t.Number({ minimum: 1, error: "minimum user page is only 1" }),
        limit: t.Number({ maximum: 30, default: 16, error: "maximum user each page is 30 and the minimum is 16" }),
        skip: t.Number({ maximum: 30, default: 16, error: "The maximum number of users data passed is 30 and the minimum is 16" }),
        username: t.Optional(t.String({ minLength: 1, error: "invalid username" }))
    }),
    params: t.Object({
        followed_user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid followed user"}),
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid user" })
    })
}

export type TRelation = {
    [k in keyof typeof relationSchema]: UnwrapSchema<typeof relationSchema[k]>;
}
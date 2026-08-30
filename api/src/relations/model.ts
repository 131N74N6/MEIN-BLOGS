import { t, UnwrapSchema } from "elysia";

export const relationSchema = {
    add: t.Object({
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid data" }),
        followed_user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid data"})
    }),
    pagination: t.Object({
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid data" }),
        followed_user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        page: t.Number({ minimum: 1, error: "invlalid data" }),
        limit: t.Number({ maximum: 30, default: 16, error: "invalid data" }),
        skip: t.Number({ maximum: 30, default: 16, error: "invalid data" }),
        username: t.Optional(t.String({ minLength: 1, error: "invalid username" }))
    }),
    params: t.Object({
        followed_user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        user_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid data" })
    })
}

export type TRelation = {
    [k in keyof typeof relationSchema]: UnwrapSchema<typeof relationSchema[k]>;
}
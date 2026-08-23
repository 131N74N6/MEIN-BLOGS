import { t, UnwrapSchema } from "elysia";

export const relationSchema = {
    add: t.Object({
        created_at: t.Date({ error: "invalid date" }),
        user_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }),
        followed_user_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        username: t.String({ minLength: 1, error: "invalid username" }),
        profile_picture: t.Union([t.String(), t.Null()]),
    }),
    pagination: t.Object({
        user_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }),
        followed_user_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        page: t.Number({ minimum: 1, error: "invlalid data" }),
        limit: t.Number({ maximum: 30, default: 16, error: "invalid data" }),
        skip: t.Number({ maximum: 30, default: 16, error: "invalid data" })
    }),
    params: t.Object({
        followed_user_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        user_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" })
    })
}

export type TRelation = {
    [k in keyof typeof relationSchema]: UnwrapSchema<typeof relationSchema[k]>;
}
import { t, UnwrapSchema } from "elysia";

export const viewerSchema = {
    data: t.Object({
        blog_id: t.String({ format: "^[0-9a-fA-Z]{24}$", error: "invalid data" }),
        created_at: t.Date({ error: "invalid date" }),
        profile_picture: t.Union([t.String(), t.Null()]),
        user_id: t.String({ format: "^[0-9a-fA-Z]{24}$", error: "invalid data" }),
        username: t.String({ minLength: 1, error: "invalid username" }),
    }),
    pagination: t.Object({
        blog_id: t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data"}),
        page: t.Number({ default: 1, minimum: 1, error: "invalid data" }),
        limit: t.Number({ default: 16, maximum: 30, error: "invalid data" }),
        skip: t.Number({ default: 16, maximum: 30, error: "invalid data"})
    }),
    params: t.Object({
        blog_id: t.String({ error: "invalid data" })
    })
}

export type TViewer = {
    [k in keyof typeof viewerSchema]: UnwrapSchema<typeof viewerSchema[k]>;
}
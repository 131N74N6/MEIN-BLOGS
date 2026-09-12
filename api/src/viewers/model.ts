import { t, UnwrapSchema } from "elysia";

export const viewerSchema = {
    data: t.Object({
        blog_id: t.String({ pattern: "^[0-9a-fA-Z]{24}$", error: "invalid blog" }),
        blog_owner_id: t.String({ pattern: "^[0-9a-fA-Z]{24}$", error: "invalid blog owner" }),
        created_at: t.Date({ error: "invalid date" }),
        profile_picture: t.Union([t.String(), t.Null()]),
        user_id: t.String({ pattern: "^[0-9a-fA-Z]{24}$", error: "invalid user" }),
        username: t.String({ minLength: 1, error: "invalid username" }),
    }),
    pagination: t.Object({
        blog_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid blog"}),
        page: t.Number({ default: 1, minimum: 1, error: "minimum viewer page is only 1" }),
        limit: t.Number({ default: 16, maximum: 30, error: "maximum viewer each page is 30 and the minimum is 16" }),
        skip: t.Number({ default: 16, maximum: 30, error: "The maximum number of viewers data passed is 30 and the minimum is 16"})
    }),
    params: t.Object({
        blog_id: t.String({ error: "invalid blog" }),
        blog_owner_id: t.String({ error: "invalid blog owner" })
    })
}

export type TViewer = {
    [k in keyof typeof viewerSchema]: UnwrapSchema<typeof viewerSchema[k]>;
}
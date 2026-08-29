import { t, UnwrapSchema } from "elysia";
import { User } from "../auth/model";

export const userSchema = {
    change_raw: t.Object({
        id: t.String({ error: "invalid data", pattern: "^[0-9a-fA-F]{24}$" }),
        description: t.Optional(t.Union([t.String({ error: "invalid data" }), t.Null(), t.Undefined()])),
        name: t.String({ minLength: 1, error: "invalid username" }),
        image: t.Union([
            t.File({ type: "image/*", maxSize: 6 * 1024 * 1024, error: "invalid file" }),
            t.Null(), t.Undefined()
        ]),
        updatedAt: t.Date({ error: "invalid date" })
    }),
    change_result: t.Object({
        id: t.String({ error: "invalid data", pattern: "^[0-9a-fA-F]{24}$" }),
        description: t.Optional(t.Union([t.String({ error: "invalid data" }), t.Null(), t.Undefined()])),
        name: t.String({ minLength: 1, error: "invalid username" }),
        image: t.String({ error: "invalid file" }),
        image_public_id: t.Optional(t.Union([t.String(), t.Null(), t.Undefined()])),
        image_filename: t.Optional(t.Union([t.String(), t.Null(), t.Undefined()])),
        image_filetype: t.Optional(t.Union([t.String(), t.Null(), t.Undefined()])),
        image_resource_type: t.Optional(t.Union([t.String(), t.Null(), t.Undefined()])),
        updatedAt: t.Date({ error: "invalid date" })
    }),
    data: t.Unsafe<User>({ error: "invalid data" }),
    other_user: t.Object({
        user_id: t.String({ error: "invalid data", pattern: "^[0-9a-fA-F]{24}$" })
    })
}

export type TUser = {
    [k in keyof typeof userSchema]: UnwrapSchema<typeof userSchema[k]>;
}
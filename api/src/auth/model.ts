import { t, UnwrapSchema } from "elysia";

export const authSchema = {
    cookie: t.Cookie({
        jwt_auth_token: t.Optional(t.String())
    }),
    jwt_payload: t.Object({
        _id: t.String({ minLength: 1, error: "invalid user" })
    }),
    sign_in: t.Object({
        email: t.String({ minLength: 1, error: "invalid email"}),
        password: t.String({ minLength: 1, error: "invalid password" })
    }),
    sign_up: t.Object({
        username: t.String({ minLength: 1, error: "invalid username" }),
        email: t.String({ minLength: 1, error: "invalid email" }),
        password: t.String({ minLength: 1, error: "invalid password" })
    })
}

export type TAuths = {
    [k in keyof typeof authSchema]: UnwrapSchema<typeof authSchema[k]>;
}
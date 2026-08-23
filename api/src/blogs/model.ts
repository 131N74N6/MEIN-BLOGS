import { t, UnwrapSchema } from "elysia";
import { ObjectId } from "mongodb";

export const blogSchema = {
    add_raw: t.Object({
        blog_owner_id: t.Transform(t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),

        blog_owner_profile_picture: t.Union([t.String(), t.Null()]),
        blog_owner_name: t.String({ minLength: 1, error: "invalid data"}),
        created_at: t.Date({ error: "invalid date" }),
        content: t.String({ minLenength: 1, error: "invalid language"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.File({ maxSize: 6 * 1024 * 1024, type: "image/*", error: "invalid file" }),
        title: t.String({ minLength: 1, error: "invalid title"}),
        updated_at: t.Date({ error: "invalid date" })
    }),
    add_result: t.Object({
        blog_owner_id: t.Transform(t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),

        blog_owner_profile_picture: t.Union([t.String(), t.Null()]),
        blog_owner_name: t.String({ minLength: 1, error: "invalid data"}),
        created_at: t.Date({ error: "invalid date" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.Object({
            filename: t.String({ minLength: 1, error: "invalid filename"}),
            filetype: t.String({ minLength: 1, error: "invalid filetype"}),
            public_id: t.String({ minLength: 1, error: "invalid public_id"}),
            resource_type: t.String({ minLength: 1, error: "invalid resource_type"}),
            url: t.String({ minLength: 1, error: "invalid url"}),
        }),
        title: t.String({ minLength: 1, error: "invalid title"}),
        updated_at: t.Date({ error: "invalid date" })
    }),
    change_raw: t.Object({
        _id: t.Transform(t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),

        blog_owner_id: t.Transform(t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),
        
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.File({ maxSize: 6 * 1024 * 1024, type: "image/*", error: "invalid file" }),
        title: t.String({ minLength: 1, error: "invalid title"}),
        updated_at: t.Date({ error: "invalid date" })
    }),
    change_result: t.Object({
        _id: t.Transform(t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),

        blog_owner_id: t.Transform(t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),

        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.Object({
            filename: t.String({ minLength: 1, error: "invalid filename"}),
            filetype: t.String({ minLength: 1, error: "invalid filetype"}),
            public_id: t.String({ minLength: 1, error: "invalid public_id"}),
            resource_type: t.String({ minLength: 1, error: "invalid resource_type"}),
            url: t.String({ minLength: 1, error: "invalid url"}),
        }),
        title: t.String({ minLength: 1, error: "invalid title"}),
        updated_at: t.Date({ error: "invalid date" })
    }),
    data: t.Object({
        _id: t.Transform(t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),

        blog_owner_id: t.Transform(t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),

        blog_owner_profile_picture: t.Union([t.String(), t.Null()]),
        blog_owner_name: t.String({ minLength: 1, error: "invalid data"}),
        created_at: t.Date({ error: "invalid date" }),
        content: t.String({ minLength: 1, error: "invalid content"}),
        language: t.String({ minLength: 1, error: "invalid language"}),
        media: t.Object({
            filename: t.String({ minLength: 1, error: "invalid filename"}),
            filetype: t.String({ minLength: 1, error: "invalid filetype"}),
            public_id: t.String({ minLength: 1, error: "invalid public_id"}),
            resource_type: t.String({ minLength: 1, error: "invalid resource_type"}),
            url: t.String({ minLength: 1, error: "invalid url"}),
        }),
        title: t.String({ minLength: 1, error: "invalid title"}),
        updated_at: t.Date({ error: "invalid date" })
    }),
    generate: t.Object({
        language: t.String({ minLength: 1, error: "invalid language"}),
        title: t.String({ minLength: 1, error: "invalid title"}),
    }),
    pagination: t.Object({
        blog_owner_id: t.Transform(t.String({ format: "^[0-9a-fA-F]{24}$", error: "invalid data" }))
        .Decode(value => new ObjectId(value))
        .Encode(value => value.toHexString()),

        limit: t.Number({ maximum: 30, default: 16, error: "Invalid data" }),
        page: t.Number({ default: 1, minimum: 1, error: "Invalid data" }),
        skip: t.Number({ maximum: 30, default: 16, error: "Invalid data" })
    }),
    params: t.Object({
        _id: t.String({ error: "Invalid data" })
    }),
    query: t.Object({
        title: t.String({ minLength: 1, error: "invalid title"}),
    })
}

export type TBlogs = {
    [k in keyof typeof blogSchema]: UnwrapSchema<typeof blogSchema[k]>;
}
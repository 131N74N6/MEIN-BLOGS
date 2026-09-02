import { t, UnwrapSchema } from "elysia";

export const userChatSchema = {
    add_raw: t.Object({
        media: t.Union([
            t.Array(t.File({ 
                maxSize: 6 * 1024 * 1024, type: ["image/*", "video/*"], error: "unsupported file" 
            })),
            t.Null()
        ]),
        message: t.String({ minLength: 1, error: "invalid message" }),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid sender" }),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" })
    }),

    add_result: t.Object({
        media: t.Union([
            t.Array(t.Object({ 
                filename: t.String({ error: "invalid filename" }),
                filetype: t.String({ error: "invalid filename" }),
                public_id: t.String({ error: "invalid filename" }),
                resource_type: t.String({ error: "invalid filename" }),
                url: t.String({ error: "invalid filename" })
            })), 
            t.Null()
        ]),
        message: t.String({ minLength: 1, error: "invalid message" }),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid sender" }),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" })
    }),

    change_result: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid chat" }),
        message: t.Optional(t.String({ minLength: 1, error: "invalid message" }))
    }),

    delete_chat: t.Object({
        message_ids: t.Array(t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid chat" })),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" }),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid sender" })
    }),

    pagination: t.Object({
        limit: t.Number({ default: 50, error: "invalid limit", maximum: 54 }),
        page: t.Number({ default: 1, error: "invalid first page", minimum: 1 }),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" }),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid sender" }),
        skip: t.Number({ default: 50, error: "invalid skip", maximum: 54 })
    }),

    ws_message: t.Object({
        type: t.Enum({ 
            JOIN: "JOIN",
            SEND: "SEND", 
            EDIT: "EDIT", 
            DELETE_CHOSEN: "DELETE_CHOSEN", 
            DELETE_ALL: "DELETE_ALL" 
        }),
        payload: t.Any()
    })
}

export const getChatRoomId = (id1: string, id2: string) => {
    const sorted = [id1, id2].sort();
    return `chat_${sorted[0]}_${sorted[1]}`;
}

export type TUserChat = {
    [k in keyof typeof userChatSchema]: UnwrapSchema<typeof userChatSchema[k]>;
}
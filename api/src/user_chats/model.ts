import { t, UnwrapSchema } from "elysia";

export const userChatSchema = {
    add_raw: t.Object({
        media: t.Optional(t.Union([
            t.File({ 
                maxSize: 6 * 1024 * 1024, 
                type: ["image/*", "video/*", "application/*"], error: "unsupported file" 
            }),
            t.Array(t.File({ 
                maxSize: 6 * 1024 * 1024, 
                type: ["image/*", "video/*", "application/*"], error: "unsupported file" 
            }))
        ])),
        message: t.Optional(t.String({ error: "invalid message" })),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid sender" }),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" })
    }),

    add_result: t.Object({
        media: t.Optional(
            t.Array(
                t.Object({ 
                    filename: t.String({ error: "invalid filename" }),
                    filetype: t.String({ error: "invalid filename" }),
                    public_id: t.String({ error: "invalid filename" }),
                    resource_type: t.String({ error: "invalid filename" }),
                    url: t.String({ error: "invalid filename" })
                })
            )
        ),
        message: t.Optional(t.String({ error: "invalid message" })),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid sender" }),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" })
    }),

    change_result: t.Object({
        _id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid message" }),
        message: t.Optional(t.String({ error: "invalid message" })),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid message receiver" }),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid message owner" })
    }),

    delete_chat: t.Object({
        message_ids: t.Array(t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid messages" })),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" }),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid sender" })
    }),

    pagination: t.Object({
        limit: t.Number({ default: 52, error: "invalid limit", maximum: 54 }),
        page: t.Number({ default: 1, error: "invalid first page", minimum: 1 }),
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" }),
        sender_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid sender" }),
        skip: t.Number({ default: 52, error: "invalid skip", maximum: 54 })
    }),

    ws_config: t.Object({
        receiver_id: t.String({ pattern: "^[0-9a-fA-F]{24}$", error: "invalid receiver" }),
        token: t.String({ minLength: 1, error: "invalid token" })
    })
}

export type TUserChat = {
    [k in keyof typeof userChatSchema]: UnwrapSchema<typeof userChatSchema[k]>;
}

export type ExecuteDelete = {
    chatsToDeletePermanently: any[];
    chatsToDeleteTemporarily: any[];
    chatsToHide: any[];
    senderId: string;
}

export type ExecuteMediaDelete = {
    chats: any[]; 
    deleteFn: (ids: any[]) => Promise<any>;
    operations: Promise<any>[];
}

export type UserChatWsPayload = {
    type: "error" | "message:created" | "message:updated" | "message:deleted";
    data: any;
};
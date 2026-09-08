import { ObjectId } from "mongodb";
import { db } from "../mongodb/service";
import { TUserChat } from "./model";

class UserChatRepository {
    private user_chats = db().collection("user_chats");

    private formattedDoc(data: any) {
        if (!data) return null;
        return {
            ...data,
            _id: data._id.toString(),
            sender_id: data.sender_id.toString(),
            receiver_id: data.receiver_id.toString(),
            hidden_for: (data.hidden_for || []).map((h: ObjectId) => h.toString())
        }
    }

    async changeMessage(data: TUserChat["change_result"]) {
        const result = await this.user_chats.findOneAndUpdate(
            { 
                _id: new ObjectId(data._id), 
                sender_id: new ObjectId(data.sender_id), 
                receiver_id: new ObjectId(data.receiver_id) 
            }, 
            { $set: { message: data.message, updated_at: new Date() }}, 
            { returnDocument: "after"}
        );

        return this.formattedDoc(result);
    }

    async deleteAllMessagesPermanently(message_ids: ObjectId[]) {
        return await this.user_chats.deleteMany({ _id: { $in: message_ids } });
    }

    async deleteAllMessagesTemporary(message_ids: ObjectId[]) {
        await this.user_chats.updateMany({ _id: { $in: message_ids } }, {
            $set: {
                media: [],
                message: "This message has been deleted"
            }
        });
        
        return message_ids;
    }

    async findAllMessages(data: Pick<TUserChat["pagination"], "receiver_id" | "sender_id">) {
        return await this.user_chats.find({ 
            $or: [
                { receiver_id: new ObjectId(data.receiver_id), sender_id: new ObjectId(data.sender_id) },
                { receiver_id: new ObjectId(data.sender_id), sender_id: new ObjectId(data.receiver_id) }
            ]
        })
        .toArray();
    }

    async findAllMessagesByIds(message_ids: string[]) {
        const ids = message_ids.map(id => new ObjectId(id));
        return await this.user_chats.find({ _id: { $in: ids } }).toArray();
    }

    async findOneMessage(id: string) {
        return await this.user_chats.findOne({ _id: new ObjectId(id) });
    }

    async getAllMessages(data: Omit<TUserChat["pagination"], "page">) {
        const chats = await this.user_chats.find({ 
            $or: [
                { receiver_id: new ObjectId(data.receiver_id), sender_id: new ObjectId(data.sender_id) },
                { receiver_id: new ObjectId(data.sender_id), sender_id: new ObjectId(data.receiver_id) }
            ], 
            hidden_for: { $nin: [new ObjectId(data.sender_id)] } 
        })
        .sort({ created_at: -1 })
        .limit(data.limit)
        .skip(data.skip)
        .toArray();

        return chats.map(this.formattedDoc);
    }

    async hideAllMessage(user_id: string, message_ids: ObjectId[]) {
        await this.user_chats.updateMany({ _id: { $in: message_ids } }, {
            $addToSet: { hidden_for: new ObjectId(user_id) }
        });

        return message_ids;
    }
    
    async sendMessage(data: TUserChat["add_result"]) {
        const result = await this.user_chats.insertOne({
            created_at: new Date(),
            hidden_for: [],
            media: data.media || [],
            message: data.message || "",
            sender_id: new ObjectId(data.sender_id),
            receiver_id: new ObjectId(data.receiver_id),
            updated_at: new Date()
        });

        const doc = await this.user_chats.findOne({ _id: result.insertedId });
        return this.formattedDoc(doc);
    }
}

const userChatRepository = new UserChatRepository();

export default userChatRepository;
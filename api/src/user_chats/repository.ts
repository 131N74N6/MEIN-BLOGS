import { ObjectId } from "mongodb";
import { db } from "../mongodb/service";
import { TUserChat } from "./model";

class UserChatRepository {
    private user_chats = db().collection("user_chats");

    async changeMessage(data: TUserChat["change_result"]) {
        return await this.user_chats.updateOne({ _id: new ObjectId(data._id) }, {
            message: data.message,
            updated_at: new Date()
        });
    }

    async deleteAllMessagesPermanently(message_ids: ObjectId[]) {
        return await this.user_chats.deleteMany({ _id: { $in: message_ids } });
    }

    async deleteAllMessagesTemporary(message_ids: ObjectId[]) {
        return await this.user_chats.updateMany({ _id: { $in: message_ids } }, {
            $set: {
                media: [],
                message: "This message has been deleted"
            }
        });
    }

    async findAllMessages(data: Pick<TUserChat["pagination"], "receiver_id" | "sender_id">) {
        return await this.user_chats.find({ 
            $or: [
                { receiver_id: data.receiver_id, sender_id: data.sender_id },
                { receiver_id: data.sender_id, sender_id: data.receiver_id }
            ]
        })
        .toArray();
    }

    async findAllMessagesByIds(message_ids: string[]) {
        const ids = message_ids.map(id => new ObjectId(id));
        return await this.user_chats.find({ _id: { $in: ids } }).toArray();
    }

    async getAllMessages(data: Omit<TUserChat["pagination"], "page">) {
        return await this.user_chats.find({ 
            $or: [
                { receiver_id: data.receiver_id, sender_id: data.sender_id },
                { receiver_id: data.sender_id, sender_id: data.receiver_id }
            ]
        })
        .limit(data.limit)
        .skip(data.skip)
        .toArray();
    }

    async hideAllMessage(user_id: string, message_ids: ObjectId[]) {
        return await this.user_chats.updateMany({ _id: { $in: message_ids } }, {
            $addToSet: { hidden_for: new ObjectId(user_id) }
        });
    }
    
    async sendMessage(data: TUserChat["add_result"]) {
        return await this.user_chats.insertOne({
            created_at: new Date(),
            hidden_for: [],
            media: data.media,
            message: data.message,
            sender_id: new ObjectId(data.sender_id),
            receiver_id: new ObjectId(data.receiver_id),
            updated_at: new Date()
        });
    }
}

const userChatRepository = new UserChatRepository();

export default userChatRepository;
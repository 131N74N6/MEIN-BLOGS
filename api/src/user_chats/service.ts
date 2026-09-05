import { ObjectId } from "mongodb";
import { ExecuteDelete, ExecuteMediaDelete, TUserChat } from "./model";
import userChatRepository from "./repository";
import { BlogApiError } from "../error/service";
import { uploadToCloudinary } from "../cloudinary/service";
import { v2 } from "cloudinary";

class UserChatService {
    private checkIsIdValid(field: string, value: unknown) {
        if (!value || value === "" || typeof value !== "string" || !ObjectId.isValid(value)) {
            if (field === "sender id") throw new BlogApiError(400, "invalid sender");
            else if (field === "receiver") throw new BlogApiError(400, "invalid receiver");
            else throw new BlogApiError(400, "invalid message");
        }

        return value;
    }

    private checkIsInputValid(field: string, min: number, value: unknown) {
        if (!value || value === "" || typeof value !== "string" || min < 0 || min === 0) {
            throw new BlogApiError(400, `invalid ${field}`);
        }
        
        return value;
    }

    async changeMessage(data: TUserChat["change_result"]) {
        const messageId = this.checkIsIdValid("", data._id);
        const updatedMessage = this.checkIsInputValid("message", 1, data.message);

        return await userChatRepository.changeMessage({ _id: messageId, message: updatedMessage });
    }

    async clearAllMessages(data: Omit<TUserChat["delete_chat"], "message_ids">) {
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);

        const chats = await userChatRepository.findAllMessages({ receiver_id: receiverId, sender_id: senderId });
        if (chats.length === 0) throw new BlogApiError(404, "messages not found");

        const toDeleteChatPermanent = chats.filter(chat => {
            return chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId);
        });

        const toDeleteChatTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId);
        });
        
        await this.executeDeletions({ 
            chatsToDeletePermanently: toDeleteChatPermanent, 
            chatsToDeleteTemporarily: toDeleteChatTemporary,
            chatsToHide: [],
            senderId: senderId
        });
    }

    async clearChosenMessages(data: TUserChat["delete_chat"]) {
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);
        const messageIds = data.message_ids.map(id => this.checkIsIdValid("", id));

        const chats = await userChatRepository.findAllMessagesByIds(messageIds);
        if (chats.length === 0) throw new BlogApiError(404, "messages not found");

        const toDeleteChatPermanent = chats.filter(chat => {
            return chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId);
        });

        const toDeleteChatTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId);
        });

        await this.executeDeletions({
            chatsToDeletePermanently: toDeleteChatPermanent,
            chatsToDeleteTemporarily: toDeleteChatTemporary,
            chatsToHide: [],
            senderId: senderId
        });
    }

    async deleteAllMessages(data: Omit<TUserChat["delete_chat"], "message_ids">) {
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);

        const chats = await userChatRepository.findAllMessages({ receiver_id: receiverId, sender_id: senderId });
        if (chats.length === 0) throw new BlogApiError(404, "messages not found");
        
        const deleteOwnPermanent = chats.filter(chat => {
            return chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId) &&
            (chat.receiver_id.toString() === receiverId && chat.sender_id.toString() === senderId);
        });

        const deleteOwnTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId) &&
            (chat.receiver_id.toString() === receiverId && chat.sender_id.toString() === senderId);
        });

        const deleteOtherPermanent = chats.filter(chat => {
            return chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId) &&
            (chat.receiver_id.toString() === senderId && chat.sender_id.toString() === receiverId);
        });

        const deleteOtherTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId) &&
            (chat.receiver_id.toString() === senderId && chat.sender_id.toString() === receiverId);
        });


        await this.executeDeletions({
            chatsToDeletePermanently: [...deleteOwnPermanent, ...deleteOtherPermanent],
            chatsToDeleteTemporarily: deleteOtherTemporary,
            chatsToHide: deleteOwnTemporary,
            senderId: senderId
        });

        const affectedIds = chats.map(chat => chat._id.toString());
        
        return {
            deleted_message_ids: affectedIds,
            receiver_id: data.receiver_id,
            sender_id: data.sender_id
        }
    }

    async deleteChosenMessages(data: TUserChat["delete_chat"]) {
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);
        const messageIds = data.message_ids.map(id => this.checkIsIdValid("", id));

        const chats = await userChatRepository.findAllMessagesByIds(messageIds);
        if (chats.length === 0) throw new BlogApiError(404, "messages not found");

        const deleteOwnPermanent = chats.filter(chat => {
            return chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId) &&
            (chat.receiver_id.toString() === receiverId && chat.sender_id.toString() === senderId);
        });

        const deleteOwnTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId) &&
            (chat.receiver_id.toString() === receiverId && chat.sender_id.toString() === senderId);
        });

        const deleteOtherPermanent = chats.filter(chat => {
            return chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId) &&
            (chat.receiver_id.toString() === senderId && chat.sender_id.toString() === receiverId);
        });

        const deleteOtherTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((hidden: ObjectId) => hidden.toString() === receiverId) &&
            (chat.receiver_id.toString() === senderId && chat.sender_id.toString() === receiverId);
        });

        await this.executeDeletions({
            chatsToDeletePermanently: [...deleteOtherPermanent, ...deleteOwnPermanent],
            chatsToDeleteTemporarily: deleteOtherTemporary,
            chatsToHide: deleteOwnTemporary,
            senderId: senderId
        });

        return { 
            deleted_message_ids: data.message_ids,
            receiver_id: data.receiver_id,
            sender_id: data.sender_id
        }
    }

    private async executeDeletions(props: ExecuteDelete) {
        const operations: Promise<any>[] = [];

        this.executeMediaDeletions({ 
            chats: props.chatsToDeletePermanently, 
            deleteFn: userChatRepository.deleteAllMessagesPermanently,
            operations: operations
        });

        this.executeMediaDeletions({
            chats: props.chatsToDeleteTemporarily, 
            deleteFn: userChatRepository.deleteAllMessagesTemporary,
            operations: operations
        });

        if (props.chatsToHide.length > 0) {
            const ids = props.chatsToHide.map(chat => chat._id);
            operations.push(userChatRepository.hideAllMessage(props.senderId, ids));
        }

        if (operations.length > 0) await Promise.all(operations);
    }

    private executeMediaDeletions (props: ExecuteMediaDelete) {
        if (props.chats.length === 0) return;
        const ids = props.chats.map(chat => chat._id);
        
        const selectedMedia = props.chats.flatMap(chat => chat.media || []);

        if (selectedMedia.length > 0) {
            const deleteFromCloudinary = selectedMedia.map(media => 
                v2.uploader.destroy(media.public_id, { resource_type: media.resource_type })
            );
            props.operations.push(...deleteFromCloudinary);
        }

        props.operations.push(props.deleteFn(ids));
    }

    async getAllMessages(data: Omit<TUserChat["pagination"], "page">) {
        return await userChatRepository.getAllMessages(data);
    }

    async isOwnMessage(sender_id: string) {
        const senderId = this.checkIsIdValid("sender id", sender_id);
        const chat = await userChatRepository.getMessageBySenderId(senderId);
        if (!chat) throw new BlogApiError(404, "message not found");

        const isOwner = chat.sender_id.toString() === senderId;
        return isOwner;
    }

    async sendMessage(data: TUserChat["add_raw"]) {
        let selectedMedia: any[] = [];
        const newMessage = this.checkIsInputValid("message", 1, data.message);
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);

        if (data.media && data.media.length > 0) {
            const uploadPromises = data.media.map(async (file) => {
                if (!file.type.includes("image") && !file.type.includes("video")) {
                    throw new BlogApiError(400, `unsupported file type: ${file.name}`);
                }

                const fileArrayBuffer = await file.arrayBuffer();
                const fileBuffer = Buffer.from(fileArrayBuffer);
                
                return await uploadToCloudinary({
                    file_buffer: fileBuffer,
                    foldername: "chat_media",
                    mimetype: file.type,
                    original_name: file.name
                });
            });

            selectedMedia = await Promise.all(uploadPromises);
        }

        return await userChatRepository.sendMessage({
            media: selectedMedia,
            message: newMessage,
            receiver_id: receiverId,
            sender_id: senderId,
        });
    }
}

const userChatService = new UserChatService();

export default userChatService;
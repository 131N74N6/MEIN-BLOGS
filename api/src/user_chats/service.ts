import { ObjectId } from "mongodb";
import { TUserChat } from "./model";
import userChatRepository from "./repository";
import { BlogApiError } from "../error/handler";
import { uploadToCloudinary } from "../cloudinary/service";
import { v2 } from "cloudinary";

class UserChatService {
    private checkIsIdValid(field: string, value: unknown) {
        if (!value || value === "" || typeof value !== "string" || ObjectId.isValid(value)) {
            if (field === "sender id") throw new BlogApiError(400, "invalid sender");
            else if (field === "receiver") throw new BlogApiError(400, "invalid receiver");
            else throw new BlogApiError(400, "invalid chat");
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
        const operations = [];
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
        
        if (toDeleteChatPermanent.length > 0) {
            const ids = toDeleteChatPermanent.map(chat => chat._id);
            const selectedMedia = toDeleteChatPermanent.flatMap(chat => chat.media);

            if (selectedMedia.length > 0) {
                const deleteFromCloudinary = selectedMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });

                operations.push(...deleteFromCloudinary);
            }
            
            operations.push(userChatRepository.deleteAllMessagesPermanently(ids));
        }

        if (toDeleteChatTemporary.length > 0) {
            const ids = toDeleteChatTemporary.map(chat => chat._id);
            operations.push(userChatRepository.hideAllMessage(senderId, ids));
        }

        if (operations.length > 0) await Promise.all(operations);
    }

    async clearChosenMessages(data: TUserChat["delete_chat"]) {
        const operations = [];
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

        const selectedMedia = toDeleteChatPermanent.flatMap(chat => chat.media);

        if (toDeleteChatPermanent.length > 0) {
            const ids = toDeleteChatPermanent.map(chat => chat._id);

            if (selectedMedia.length > 0) {
                const deleteFromCloudinary = selectedMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });

                operations.push(...deleteFromCloudinary);
            }
            
            operations.push(userChatRepository.deleteAllMessagesPermanently(ids));
        }

        if (toDeleteChatTemporary.length > 0) {
            const ids = toDeleteChatTemporary.map(chat => chat._id);
            operations.push(userChatRepository.hideAllMessage(senderId, ids));
        }

        if (operations.length > 0) await Promise.all(operations);
    }

    async deleteAllMessages(data: Omit<TUserChat["delete_chat"], "message_ids">) {
        const operations = [];
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


        if (deleteOwnPermanent.length > 0) {
            const ids = deleteOwnPermanent.map(chat => chat._id);
            const selectedMedia = deleteOwnPermanent.flatMap(chat => chat.media);

            if (selectedMedia.length > 0) {
                const deleteFromCloudinary = selectedMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });

                operations.push(...deleteFromCloudinary);
            }
            
            operations.push(userChatRepository.deleteAllMessagesPermanently(ids));
        }

        if (deleteOwnTemporary.length > 0) {
            const ids = deleteOwnTemporary.map(chat => chat._id);
            const selectedMedia = deleteOwnTemporary.flatMap(chat => chat.media);

            if (selectedMedia.length > 0) {
                const deleteFromCloudinary = selectedMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });

                operations.push(...deleteFromCloudinary);
            }
            
            operations.push(userChatRepository.deleteAllMessagesTemporary(ids));
        }

        if (deleteOtherPermanent.length > 0) {
            const ids = deleteOtherPermanent.map(chat => chat._id);
            const selectedMedia = deleteOtherPermanent.flatMap(chat => chat.media);

            if (selectedMedia.length > 0) {
                const deleteFromCloudinary = selectedMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });

                operations.push(...deleteFromCloudinary);
            }
            
            operations.push(userChatRepository.deleteAllMessagesPermanently(ids));
        }

        if (deleteOtherTemporary.length > 0) {
            const ids = deleteOtherTemporary.map(chat => chat._id);
            operations.push(userChatRepository.hideAllMessage(senderId, ids));
        }

        if (operations.length > 0) await Promise.all(operations);

        const affectedIds = chats.map(chat => chat._id.toString());
        
        return {
            deleted_message_ids: affectedIds,
            receiver_id: data.receiver_id,
            sender_id: data.sender_id
        }
    }

    async deleteChosenMessages(data: TUserChat["delete_chat"]) {
        const operations = [];
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

        if (deleteOwnPermanent.length > 0) {
            const ids = deleteOwnPermanent.map(chat => chat._id);
            const selectedMedia = deleteOwnPermanent.flatMap(chat => chat.media);

            if (selectedMedia.length > 0) {
                const deleteFromCloudinary = selectedMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });

                operations.push(...deleteFromCloudinary);
            }

            operations.push(userChatRepository.deleteAllMessagesPermanently(ids));
        }

        if (deleteOwnTemporary.length > 0) {
            const ids = deleteOwnTemporary.map(chat => chat._id);
            const selectedMedia = deleteOwnTemporary.flatMap(chat => chat.media);

            if (selectedMedia.length > 0) {
                const deleteFromCloudinary = selectedMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });

                operations.push(...deleteFromCloudinary);
            }
            
            operations.push(userChatRepository.deleteAllMessagesTemporary(ids));
        }

        if (deleteOtherPermanent.length > 0) {
            const ids = deleteOtherPermanent.map(chat => chat._id);
            const selectedMedia = deleteOtherPermanent.map(chat => chat.media);

            if (selectedMedia.length > 0) {
                const deleteFromCloudinary = selectedMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { resource_type: media.resource_type });
                });

                operations.push(...deleteFromCloudinary);
            }

            operations.push(userChatRepository.deleteAllMessagesPermanently(ids));
        }

        if (deleteOtherTemporary.length > 0) {
            const ids = deleteOtherTemporary.map(chat => chat._id);
            operations.push(userChatRepository.hideAllMessage(senderId, ids));
        }

        if (operations.length > 0) await Promise.all(operations);

        return { 
            deleted_message_ids: data.message_ids,
            receiver_id: data.receiver_id,
            sender_id: data.sender_id
        }
    }

    async getAllMessages(data: Omit<TUserChat["pagination"], "page">) {
        return await userChatRepository.getAllMessages(data);
    }

    async sendMessage(data: TUserChat["add_raw"]) {
        const newMessage = this.checkIsInputValid("message", 1, data.message);
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const selectedMedia = [];
        const senderId = this.checkIsIdValid("sender id", data.sender_id);

        if (data.media && data.media.length > 0) {
            for (let a = 0; a < data.media.length; a++) {
                if (!data.media[a].type.includes("image") || !data.media[a].type.includes("video")) {
                    throw new BlogApiError(400, "unsupported file");
                }

                const fileArrayBuffer = await data.media[a].arrayBuffer();
                const fileBuffer = Buffer.from(fileArrayBuffer);
                
                const cloudinary = await uploadToCloudinary({
                    file_buffer: fileBuffer,
                    foldername: "chat_media",
                    mimetype: data.media[a].type,
                    original_name: data.media[a].name
                });

                selectedMedia.push(cloudinary);
            }
        }

        return await userChatRepository.sendMessage({
            media: selectedMedia || [],
            message: newMessage,
            receiver_id: receiverId,
            sender_id: senderId,
        });
    }
}

const userChatService = new UserChatService();

export default userChatService;
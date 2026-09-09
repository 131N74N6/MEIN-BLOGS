import { ObjectId } from "mongodb";
import { ExecuteDelete, ExecuteMediaDelete, TUserChat } from "./model";
import userChatRepository from "./repository";
import { BlogApiError } from "../error/service";
import { uploadToCloudinary } from "../cloudinary/service";
import { v2 } from "cloudinary";
import { userChatsEvents } from "./event";

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

    private async executeDeletions(props: ExecuteDelete) {
        const operations: Promise<any>[] = [];

        const affectedIds = [
            ...props.chatsToDeletePermanently.map(chat => chat._id.toString()),
            ...props.chatsToDeleteTemporarily.map(chat => chat._id.toString())
        ];

        this.executeMediaDeletions({ 
            chats: props.chatsToDeletePermanently, 
            deleteFn: (ids) => userChatRepository.deleteAllMessagesPermanently(ids),
            operations: operations
        });

        this.executeMediaDeletions({
            chats: props.chatsToDeleteTemporarily, 
            deleteFn: (ids) => userChatRepository.deleteAllMessagesTemporary(ids),
            operations: operations
        });

        if (props.chatsToHide.length > 0) {
            const ids = props.chatsToHide.map(chat => chat._id);
            operations.push(userChatRepository.hideAllMessage(props.senderId, ids));
        }

        if (operations.length > 0) await Promise.all(operations);
        return affectedIds;
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

    private getRoomId(id1: string, id2: string) {
        return [id1, id2].sort().join("_");
    }

    async changeMessage(data: TUserChat["change_result"]) {
        const messageId = this.checkIsIdValid("", data._id);
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);
        const updatedMessage = this.checkIsInputValid("message", 1, data.message);

        const message = await userChatRepository.findOneMessage(messageId);
        if (!message) throw new BlogApiError(404, "message not found");
        if (message.sender_id.toString() !== senderId) {
            throw new BlogApiError(403, "you are not allowed to change this message");
        }

        const edited = await userChatRepository.changeMessage({ 
            _id: messageId, 
            message: updatedMessage, 
            receiver_id: receiverId,
            sender_id: senderId 
        });

        const roomId = this.getRoomId(senderId, receiverId);
        userChatsEvents.emit(roomId, { type: "message:updated", data: edited });
    }

    async clearAllMessages(data: Omit<TUserChat["delete_chat"], "message_ids">) {
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);

        const chats = await userChatRepository.findAllMessages({ receiver_id: receiverId, sender_id: senderId });
        if (chats.length === 0) throw new BlogApiError(404, "messages not found");

        const toDeleteChatPermanent = chats.filter(chat => {
            return chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId);
        });

        const toDeleteChatTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId);
        });
        
        await this.executeDeletions({ 
            chatsToDeletePermanently: toDeleteChatPermanent, 
            chatsToDeleteTemporarily: [],
            chatsToHide: toDeleteChatTemporary,
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
            return chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId);
        });

        const toDeleteChatTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId);
        });

        await this.executeDeletions({
            chatsToDeletePermanently: toDeleteChatPermanent,
            chatsToDeleteTemporarily: [],
            chatsToHide: toDeleteChatTemporary,
            senderId: senderId
        });
    }

    async deleteAllMessages(data: Omit<TUserChat["delete_chat"], "message_ids">) {
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);

        const chats = await userChatRepository.findAllMessages({ receiver_id: receiverId, sender_id: senderId });
        if (chats.length === 0) throw new BlogApiError(404, "messages not found");

        const toDeleteOwnPermanent = chats.filter(chat => {
            return chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) &&
            (chat.receiver_id.toString() === receiverId && chat.sender_id.toString() === senderId);
        });

        const toDeleteOwnTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) &&
            (chat.receiver_id.toString() === receiverId && chat.sender_id.toString() === senderId);
        });

        const toDeleteOtherPermanent = chats.filter(chat => {
            return chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) &&
            (chat.receiver_id.toString() === senderId && chat.sender_id.toString() === receiverId);
        });

        const toDeleteOtherTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) &&
            (chat.receiver_id.toString() === senderId && chat.sender_id.toString() === receiverId);
        });

        const toHideDeletedChat = chats.filter(chat => {
            return !chat.hidden_for.includes(receiverId) && chat.message === "This message has been deleted";
        });
        
        const toRemoveDeletedChat = chats.filter(chat => {
            return chat.hidden_for.includes(receiverId) && chat.message === "This message has been deleted";
        });

        await this.executeDeletions({
            chatsToDeletePermanently: [
                ...toDeleteOwnPermanent, ...toDeleteOtherPermanent, ...toRemoveDeletedChat
            ],
            chatsToDeleteTemporarily: toDeleteOwnTemporary,
            chatsToHide: [...toDeleteOtherTemporary, ...toHideDeletedChat],
            senderId: senderId
        });

        const affectedIds = toDeleteOwnTemporary.map(message => message._id.toString());

        if (chats.length > 0) {
            const roomId = this.getRoomId(senderId, receiverId);
            userChatsEvents.emit(roomId, { type: "message:deleted", data: { ids: affectedIds } });
        }
    }

    async deleteChosenMessages(data: TUserChat["delete_chat"]) {
        const receiverId = this.checkIsIdValid("receiver id", data.receiver_id);
        const senderId = this.checkIsIdValid("sender id", data.sender_id);
        const messageIds = data.message_ids.map(id => this.checkIsIdValid("", id));

        const chats = await userChatRepository.findAllMessagesByIds(messageIds);
        if (chats.length === 0) throw new BlogApiError(404, "messages not found");

        const toDeleteOwnPermanent = chats.filter(chat => {
            return chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) &&
            (chat.receiver_id.toString() === receiverId && chat.sender_id.toString() === senderId);
        });

        const toDeleteOwnTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) &&
            (chat.receiver_id.toString() === receiverId && chat.sender_id.toString() === senderId);
        });

        const toDeleteOtherPermanent = chats.filter(chat => {
            return chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) &&
            (chat.receiver_id.toString() === senderId && chat.sender_id.toString() === receiverId);
        });

        const toDeleteOtherTemporary = chats.filter(chat => {
            return !chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) &&
            (chat.receiver_id.toString() === senderId && chat.sender_id.toString() === receiverId);
        });

        const toHideDeletedChat = chats.filter(chat => {
            return !chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) && 
            chat.message === "This message has been deleted";
        });
        
        const toRemoveDeletedChat = chats.filter(chat => {
            return chat.hidden_for.some((id: ObjectId) => id.toString() === receiverId) && 
            chat.message === "This message has been deleted";
        });

        await this.executeDeletions({
            chatsToDeletePermanently: [
                ...toDeleteOwnPermanent, ...toDeleteOtherPermanent, ...toRemoveDeletedChat
            ],
            chatsToDeleteTemporarily: toDeleteOwnTemporary,
            chatsToHide: [...toDeleteOtherTemporary, ...toHideDeletedChat],
            senderId: senderId
        });

        const affectedIds = toDeleteOwnTemporary.map(message => message._id.toString());

        if (chats.length > 0) {
            const roomId = this.getRoomId(senderId, receiverId);
            userChatsEvents.emit(roomId, { type: "message:deleted", data: { ids: affectedIds } });
        }
    }

    async getAllMessages(data: Omit<TUserChat["pagination"], "page">) {
        return await userChatRepository.getAllMessages(data);
    }

    async sendMessage(data: TUserChat["add_raw"]) {
        let selectedMedia: any[] = [];
        let newMessage = "";

        if (data.message) {
            newMessage = this.checkIsInputValid("message", 1, data.message);
        } else if (!data.media || data.media.length === 0) {
            throw new BlogApiError(400, "message or media is required");
        }
        
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

        const message = await userChatRepository.sendMessage({
            media: selectedMedia,
            message: newMessage,
            receiver_id: receiverId,
            sender_id: senderId,
        });

        const roomId = this.getRoomId(senderId, receiverId);
        userChatsEvents.emit(roomId, { type: "message:created", data: message });
    }
}

const userChatService = new UserChatService();

export default userChatService;
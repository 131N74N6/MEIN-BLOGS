import { TUserChat } from "./model";
import userChatService from "./service";

class UserChatController {
    async changeMessage(data: TUserChat["change_result"]) {
        await userChatService.changeMessage(data);

        return { message: "chat updated successfully", success: true };
    }

    async clearAllMessages(data: Omit<TUserChat["delete_chat"], "message_ids">) {
        await userChatService.clearAllMessages(data);

        return { message: "all messages has cleared successfully", success: true };
    }

    async clearChosenMessages(data: TUserChat["delete_chat"]) {
        await userChatService.clearChosenMessages(data);

        return { message: "chosen messages has cleared successfully", success: true };
    }

    async deleteAllMessages(data: Omit<TUserChat["delete_chat"], "message_ids">) {
        await userChatService.deleteAllMessages(data);

        return { message: "all messages has deleted successfully", success: true };
    }

    async deleteChosenMessages(data: TUserChat["delete_chat"]) {
        await userChatService.deleteChosenMessages(data);

        return { message: "chosen messages has deleted successfully", success: true };
    }

    async getAllMessages(data: Omit<TUserChat["pagination"], "skip">) {
        const page = data.page;
        const limit = data.limit;
        const skip = (page - 1) * limit;

        const messages = await userChatService.getAllMessages({
            limit: limit, skip: skip, receiver_id: data.receiver_id, sender_id: data.sender_id
        });

        return { data: messages, message: "user chat retrieved successfully", success: true };
    }

    async sendMessage(data: TUserChat["add_raw"]) {
        await userChatService.sendMessage(data);

        return { message: "message has ben sent successfully", success: true };
    }
}

const userChatController = new UserChatController();

export default userChatController;
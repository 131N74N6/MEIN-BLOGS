import { TUser } from "./model";
import userService from "./service";

class UserController {
    async changeUser(user_data: Omit<Partial<TUser["change_raw"]>, "created_at">) {
        await userService.changeUserService(user_data);
        return { message: "this user profile has changed", success: true };
    }

    async deleteOldProfile(current_user_id: string) {
        await userService.deleteCurrentUserOldProfile(current_user_id);
        return { message: "successfully delete old profile picture", success: true };
    }

    async deleteUser(current_user_id: string) {
        await userService.deleteUserService(current_user_id);
        return { message: "successfully delete user", success: true };
    }

    async getOthertUser(user_id: string) {
        const user = await userService.getOthertUser(user_id);
        return { data: user, success: true };
    }
}

const userController = new UserController();

export default userController;
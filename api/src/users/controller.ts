import { TUser } from "./model";
import userService from "./service";

class UserController {
    async changeUser(user_data: Partial<TUser["change_raw"]>) {
        await userService.changeUserService(user_data);
        return { message: "this user has changed the profile", success: true };
    }

    async deleteOldProfile(current_user_id: string) {
        await userService.deleteCurrentUserOldProfile(current_user_id);
        return { message: "successfully delete old profile picture", success: true };
    }

    async deleteUser(current_user_id: string) {
        await userService.deleteUserService(current_user_id);
        return { message: "successfully delete user", success: true };
    }

    async getCurrentUser(current_user_id: string) {
        const user = await userService.getCurrentUser(current_user_id);
        return { data: user, message: "user data retrieved successfully", success: true };
    }
}

const userController = new UserController();

export default userController;
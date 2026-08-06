import { ChangeUserIntrf, UserIntrf } from "../models/user.model";
import userRepository from "../repositories/user.repository";

class UserService {
    async changeUserService(props: ChangeUserIntrf) {
        if (props.selectedImage) {
            await userRepository.changeUserRepository({
                currentUserId: props.currentUserId,
                selectedImage: props.selectedImage,
                username: props.username
            });
        } else {
            await userRepository.changeUserRepository({
                currentUserId: props.currentUserId,
                username: props.username
            });
        }
    }

    async deleteUserService(currentUserId: string) {
        await userRepository.deleteUserRepository(currentUserId);
    }

    async deleteOldProfileService(id: string) {
        await userRepository.deleteOldProfileRepository(id);
    }

    async signInService(props: Pick<UserIntrf, "password" | "username">) {
        return await userRepository.signInRepository(props);
    }

    async signUpService(props: Omit<UserIntrf, "profile_picture">) {
        return await userRepository.signUpRepository(props);
    }

    async showProfileService(currentUserId: string) {
        return await userRepository.showProfileRepository(currentUserId);
    }
}

const userService = new UserService();

export default userService;
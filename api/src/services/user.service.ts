import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository";
import { ChangeUserIntrf, ProfilePictureIntrf, UserIntrf } from "../models/user.model";
import { uploadToCloudinary } from "./cloudinary.service";
import { v2 } from "cloudinary";

class UserService {
    async changeUserService(props: ChangeUserIntrf) {
        try {
            const user = await userRepository.getCurrentUser(props.currentUserId);
            if (!user) throw new Error("user not found");

            let newProfileImage = user.profile_picture;

            if (props.selectedImage) {
                if (user.profile_picture && user.profile_picture.public_id) {
                    await v2.uploader.destroy(user.profile_picture.public_id, { 
                        resource_type: user.profile_picture.resource_type 
                    });
                }

                newProfileImage = await uploadToCloudinary({
                    file_buffer: props.selectedImage.buffer,
                    foldername: "user_profile",
                    mimetype: props.selectedImage.mimetype,
                    original_name: props.selectedImage.originalname
                });
            }

            await userRepository.changeUser(user._id.toString(), {
                profile_picture: newProfileImage,
                username: props.username || user.username
            });
        } catch (error) {
            throw error;
        }
    }

    async deleteUserService(currentUserId: string) {
        try {
            const user = await userRepository.getCurrentUser(currentUserId);
            if (!user) throw new Error("user not found");
            
            const operations = [];
            const userBlogs = await userRepository.getCurrentUserBlogs(currentUserId);
            const userBlogsIds = userBlogs.map(userBlog => userBlog._id.toString());
            const userBlogsMedia = userBlogs.map(userBlog => userBlog.media || []);

            if (userBlogsMedia.length > 0) {
                const deleteFromCloudinary = userBlogsMedia.map(media => {
                    return v2.uploader.destroy(media.public_id, { 
                        resource_type: media.resource_type 
                    });
                });
                operations.push(...deleteFromCloudinary);
            }

            if (user.profile_picture !== null && user.profile_picture.public_id) {
                const deleteProfile = await v2.uploader.destroy(user.profile_picture.public_id, { 
                    resource_type: user.profile_picture.resource_type 
                });

                operations.push(deleteProfile);
            }

            if (operations.length > 0) await Promise.all(operations);

            await Promise.all([
                userRepository.deleteCommentsInUserBlogs(userBlogsIds),
                userRepository.deleteUserBlogs(user._id.toString()),
                userRepository.deleteUser(user._id.toString())
            ]);
        } catch (error) {
            throw error;
        }
    }

    async deleteCurrentUserOldProfile(id: string, profile_picture: ProfilePictureIntrf) {
        await Promise.all([
            v2.uploader.destroy(profile_picture.public_id, {
                resource_type: profile_picture.resource_type
            }),
            userRepository.deleteUserOldProfile(id)
        ]);
    }

    async signInService(props: Pick<UserIntrf, "password" | "username">) {
        try {
            if (!props.username && !props.password) throw new Error("all fields are required");
            if (!props.password) throw new Error("please provide password");
            if (!props.username) throw new Error("please provide username");

            const isUserFound = await userRepository.getCurrentUserByUsername(props.username);
            if (!isUserFound) throw new Error("user not found");

            const isPasswordMatch = await bcrypt.compare(props.password, isUserFound.password);
            if (!isPasswordMatch) throw new Error("incorrect password");

            const token = jwt.sign(
                { user_id: isUserFound._id, username: isUserFound.username },
                process.env.JWT_KEY || "your_secret_key",
                { expiresIn: "1d" }
            );

            return token;
        } catch (error) {
            throw error;
        }
    }

    async signUpService(props: Omit<UserIntrf, "profile_picture">) {
        try {
            if (!props.username && !props.password && !props.email) throw new Error("all fields are required");
            if (!props.email) throw new Error("please provide email");
            if (!props.password) throw new Error("please provide password");
            if (!props.username) throw new Error("please provide username");

            const isUsernameExist = await userRepository.getCurrentUserByUsername(props.username);
            if (isUsernameExist) throw new Error("this username has been taken");

            const isEmailExist = await userRepository.getCurrentUserByEmail(props.email);
            if (isEmailExist) throw new Error("this email has been taken");

            const hashedPassword = await bcrypt.hash(props.password, 10);

            const newUser = await userRepository.createNewUser({
                email: props.email,
                password: hashedPassword,
                username: props.username
            });

            const token = jwt.sign(
                { user_id: newUser._id, username: newUser.username }, 
                process.env.JWT_KEY || "your_secret_key",
                { expiresIn: "1d" }
            );

            return token;
        } catch (error) {
            throw error;
        }
    }

    async showProfileService(currentUserId: string) {
        try {
            const user = await userRepository.getCurrentUser(currentUserId);
            if (!user) throw new Error("user not found");
            return user;
        } catch (error) {
            throw error;
        }
    }
}

const userService = new UserService();

export default userService;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userRepository from "./user.repository";
import { ApiError } from "../errors/api.error";
import { ChangeUserIntrf, UserIntrf } from "./user.model";
import { uploadToCloudinary } from "../cloudinary/cloudinary.service";
import { v2 } from "cloudinary";

const allowedFileType = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxFileSize = 5 * 1024 * 1024;

class UserService {
    private checkIsUserIdValid(id: unknown): string {
        const isValid = typeof id !== "string" || typeof id === "undefined" || id === undefined || 
        id === null || id === "" || !mongoose.isValidObjectId(id);

        if (isValid) throw new ApiError(401, "unauthorized");

        return id;
    }

    private checkIsEmailValid(email: unknown): string {
        if (typeof email !== "string" || email === undefined || email === "" || email === null) {
            throw new ApiError(400, "invalid email");
        }

        const trimmed = email.trim();
        if (trimmed.length > 254) throw new ApiError(400, "invalid email");

        return trimmed;
    }

    private checkIsInputValid(value: unknown, fieldName: string, min: number, max: number): string {
        if (typeof value !== "string" || value === undefined || value === "" || value === null) {
            throw new ApiError(400, `invalid ${fieldName}`);
        }

        const trimmed = value.trim();
        if (trimmed.length < min || trimmed.length > max) throw new ApiError(400, `invalid ${fieldName}`);

        return trimmed;
    }

    private authentiationToken(userId: string, username: string) {
        const jwtToken = process.env.JWT_TOKEN;
        if (!jwtToken) throw new ApiError(500, "internal server error");

        return jwt.sign(
            { user_id: userId, username: username },
            jwtToken,
            { expiresIn: "1d" }
        )
    }
    
    async changeUserService(props: ChangeUserIntrf) {
        const currentUserId = this.checkIsUserIdValid(props.currentUserId);
        const username = this.checkIsInputValid(props.username, "username", 3, 30);

        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new ApiError(404, "user not found");
        
        if (props.selectedImage) {            
            if (!allowedFileType.includes(props.selectedImage.mimetype)) {
                throw new ApiError(400, "this file is not allowed");
            }

            if (props.selectedImage.size > maxFileSize) {
                throw new ApiError(400, "file size is too large");
            }

            if (user.profile_picture !== null && user.profile_picture.public_id !== null) {
                await v2.uploader.destroy(user.profile_picture.public_id, { 
                    resource_type: user.profile_picture.resource_type 
                });
            }

            const newProfileImage = await uploadToCloudinary({
                file_buffer: props.selectedImage.buffer,
                foldername: "user_profile",
                mimetype: props.selectedImage.mimetype,
                original_name: props.selectedImage.originalname
            });
    
            await userRepository.changeUser(user._id.toString(), {
                profile_picture: newProfileImage,
                username: username.trim() || user.username
            });
        } else {
            await userRepository.changeUser(user._id.toString(), {
                profile_picture: user.profile_picture,
                username: username.trim() || user.username
            });
        }
    }

    async deleteUserService(current_user_id: string) {
        const currentUserId = this.checkIsUserIdValid(current_user_id);

        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new ApiError(404, "user not found");
        
        const operations: Promise<unknown>[] = [];
        const userBlogs = await userRepository.getCurrentUserBlogs(currentUserId);
        const userBlogsMedia = userBlogs.map(userBlog => userBlog.media);

        if (userBlogsMedia.length > 0) {
            const deleteFromCloudinary = userBlogsMedia.map(media => {
                return v2.uploader.destroy(media.public_id, { 
                    resource_type: media.resource_type 
                });
            });
            
            operations.push(...deleteFromCloudinary);
        }

        if (user.profile_picture && user.profile_picture.public_id) {
            operations.push(
                v2.uploader.destroy(user.profile_picture.public_id, {
                    resource_type: user.profile_picture.resource_type
                })
            );
        }

        if (operations.length > 0) await Promise.all(operations);

        await userRepository.deleteUser(user._id.toString());
    }

    async deleteCurrentUserOldProfile(current_user_id: string) {
        const currentUserId = this.checkIsUserIdValid(current_user_id);

        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new ApiError(404, "user not found");

        if (!user.profile_picture || !user.profile_picture.public_id) return;

        await Promise.all([
            v2.uploader.destroy(user.profile_picture.public_id, {
                resource_type: user.profile_picture.resource_type
            }),
            userRepository.deleteCurrentUserOldProfile(currentUserId)
        ]);
    }

    async signInService(props: Pick<UserIntrf, "password" | "username">) {
        const password = this.checkIsInputValid(props.password, "password", 8, 72);
        const username = this.checkIsInputValid(props.username, "username", 3, 30);

        const user = await userRepository.getCurrentUserByUsername(username);
        if (!user) throw new ApiError(401, "invalid credentials");

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new ApiError(401, "invalid credentials");

        return this.authentiationToken(user._id.toString(), user.username);
    }

    async signUpService(props: Omit<UserIntrf, "profile_picture">) {
        const password = this.checkIsInputValid(props.password, "password", 8, 72);
        const username = this.checkIsInputValid(props.username, "username", 3, 30);
        const email = this.checkIsEmailValid(props.email);

        const [isUsernameExist, isEmailExist] = await Promise.all([
            userRepository.getCurrentUserByUsername(username),
            userRepository.getCurrentUserByEmail(email)
        ]);

        if (isUsernameExist || isEmailExist) throw new ApiError(409, "account already exists");

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await userRepository.createNewUser({
            email: email,
            password: hashedPassword,
            username: username
        });

        return this.authentiationToken(newUser._id.toString(), newUser.username);
    }

    async showProfileService(currentUserId: string) {
        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new ApiError(404, "user not found");

        return user;
    }
}

const userService = new UserService();

export default userService;
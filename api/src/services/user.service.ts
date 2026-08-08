import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import userRepository from "../repositories/user.repository";
import { ApiError } from "../errors/api.error";
import { ChangeUserIntrf, UserIntrf } from "../models/user.model";
import { uploadToCloudinary } from "../utils/cloudinary.utility";
import { v2 } from "cloudinary";

const allowedFile = ["image/jpeg", "image/png", "image/webp", "image/avif"];

class UserService {
    private assertUserId(id: unknown): string {
        if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
            throw new ApiError(401, "unauthorized");
        }

        return id;
    }

    private assertEmail(value: unknown): string {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (typeof value !== "string" || value === undefined || value === "" || value === null) {
            throw new ApiError(400, "invalid email");
        }

        const trimmed = value.trim();

        if (trimmed.length > 254) throw new ApiError(400, "invalid email");
        if (!regex.test(trimmed)) throw new ApiError(400, "invalid email");

        return trimmed;
    }

    private assertPassword(password: unknown, min: number, max: number): string {
        if (typeof password !== "string" || password === undefined || password === "" || password === null) {
            throw new ApiError(400, "invalid password");
        }

        const trimmed = password.trim();
        if (trimmed.length < min || trimmed.length > max) throw new ApiError(400, "invalid password");

        return trimmed;
    }

    private assertUsername(username: unknown, min: number, max: number): string {
        const regex = /^[a-zA-Z0-9_]+$/;

        if (typeof username !== "string" || username === undefined || username === "" || username === null) {
            throw new ApiError(400, "invalid username");
        }

        const trimmed = username.trim();

        if (!regex.test(trimmed)) throw new ApiError(400, "invalid username");
        if (trimmed.length < min || trimmed.length > max) throw new ApiError(400, "invalid username");

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
        const currentUserId = this.assertUserId(props.currentUserId);

        if (props.username !== undefined && typeof props.username !== "string") {
            throw new ApiError(400, "invalid username");
        }

        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new ApiError(404, "user not found");

        let newProfileImage = user.profile_picture;

        if (props.selectedImage) {
            if (!allowedFile.includes(props.selectedImage.mimetype)) {
                throw new ApiError(400, "this file type is not allowed");
            }

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
            username: props.username?.trim() || user.username
        });
    }

    async deleteUserService(current_user_id: string) {
        const currentUserId = this.assertUserId(current_user_id);

        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new ApiError(404, "user not found");
        
        const operations: Promise<unknown>[] = [];
        const userBlogs = await userRepository.getCurrentUserBlogs(currentUserId);
        const userBlogsIds = userBlogs.map(userBlog => userBlog._id.toString());
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

        await Promise.all([
            userRepository.deleteCommentsInUserBlogs(userBlogsIds),
            userRepository.deleteUserBlogs(user._id.toString()),
            userRepository.deleteUser(user._id.toString())
        ]);
    }

    async deleteCurrentUserOldProfile(current_user_id: string) {
        const currentUserId = this.assertUserId(current_user_id);

        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new ApiError(404, "user not found");

        if (!user.profile_picture || !user.profile_picture.public_id) return;

        await Promise.all([
            v2.uploader.destroy(user.profile_picture.public_id, {
                resource_type: user.profile_picture.resource_type
            }),
            userRepository.deleteUserOldProfile(currentUserId)
        ]);
    }

    async signInService(props: Pick<UserIntrf, "password" | "username">) {
        const password = this.assertPassword(props.password, 8, 72);
        const username = this.assertUsername(props.username, 3, 30);

        const user = await userRepository.getCurrentUserByUsername(username);
        if (!user) throw new ApiError(401, "invalid credentials");

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new ApiError(401, "invalid credentials");

        return this.authentiationToken(user._id.toString(), user.username);
    }

    async signUpService(props: Omit<UserIntrf, "profile_picture">) {
        const password = this.assertPassword(props.password, 8, 72);
        const username = this.assertUsername(props.username, 3, 30);
        const email = this.assertEmail(props.email);

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
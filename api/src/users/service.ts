import userRepository from "./repository";
import { uploadToCloudinary } from "../cloudinary/service";
import { v2 } from "cloudinary";
import { ObjectId } from "mongodb";
import { TUser } from "./model";
import { BlogApiError } from "../error/message";

const allowedFileType = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxFileSize = 6 * 1024 * 1024;

class UserService {
    private checkIsUserIdValid(id: unknown): string {
        const isNotValid = typeof id !== "string" || !id || !ObjectId.isValid(id);
        if (isNotValid) throw new BlogApiError(401, "unauthorized");

        return id;
    }

    private checkIsInputValid(value: unknown, fieldName: string, min: number, max: number): string {
        if (typeof value !== "string" || !value) throw new BlogApiError(400, `invalid ${fieldName}`);

        const trimmed = value.trim();
        if (trimmed.length < min || trimmed.length > max) throw new BlogApiError(400, `invalid ${fieldName}`);

        return trimmed;
    }
    
    async changeUserService(user_data: Omit<Partial<TUser["change_raw"]>, "created_at">) {
        const currentUserId = this.checkIsUserIdValid(user_data.id);

        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new BlogApiError(404, "user not found");
        
        let newUsername = user.name;
        
        if (user_data.name !== undefined && user_data.name !== "") {
            newUsername = this.checkIsInputValid(user_data.name, "username", 3, 30);
        }

        
        if (user_data.image) {
            const fileArrayBuffer = await user_data.image.arrayBuffer();
            const fileBuffer = Buffer.from(fileArrayBuffer);

            if (!allowedFileType.includes(user_data.image.type)) {
                throw new BlogApiError(400, "this file is not allowed");
            }

            if (user_data.image.size > maxFileSize) {
                throw new BlogApiError(400, "file size is too large");
            }

            if (user && user.image_public_id !== null) {
                await v2.uploader.destroy(user.image_public_id, { 
                    resource_type: user.image_resource_type 
                });
            }

            const newProfileImage = await uploadToCloudinary({
                file_buffer: fileBuffer,
                foldername: "user_profile",
                mimetype: user_data.image.type,
                original_name: user_data.image.name
            });
    
            await userRepository.changeUser({
                id: user_data.id,
                description: user_data.description,
                image: newProfileImage.url,
                image_filename: newProfileImage.filename,
                image_filetype: newProfileImage.filetype,
                image_public_id: newProfileImage.public_id,
                image_resource_type: newProfileImage.resource_type,
                name: user_data.name,
                updatedAt: new Date()
            });
        } else {
            await userRepository.changeUser({
                id: user_data.id,
                description: user_data.description,
                name: user_data.name,
                updatedAt: new Date()
            });
        }
    }

    async deleteUserService(current_user_id: string) {
        const currentUserId = this.checkIsUserIdValid(current_user_id);

        const user = await userRepository.getCurrentUser(currentUserId);
        if (!user) throw new BlogApiError(404, "user not found");
        
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
        if (!user) throw new BlogApiError(404, "user not found");

        if (!user.profile_picture || !user.profile_picture.public_id) return;

        await Promise.all([
            v2.uploader.destroy(user.profile_picture.public_id, {
                resource_type: user.profile_picture.resource_type
            }),
            userRepository.deleteCurrentUserOldProfile(currentUserId)
        ]);
    }

    async getOthertUser(user_id: string) {
        const user = await userRepository.getOthertUser(user_id);
        if (!user) throw new BlogApiError(404, "user not found");

        return user;
    }
}

const userService = new UserService();

export default userService;
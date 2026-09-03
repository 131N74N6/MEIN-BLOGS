import userRepository from "./repository";
import { uploadToCloudinary } from "../cloudinary/service";
import { v2 } from "cloudinary";
import { ObjectId } from "mongodb";
import { TUser } from "./model";
import { BlogApiError } from "../error/service";

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
    
    async changeUserService(user_data: Partial<TUser["change_raw"]>) {
        const currentUserId = this.checkIsUserIdValid(user_data.id);

        const user = await userRepository.getCurrentUserForEdit(currentUserId);
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

            if (user && user.image && user.image_public_id) {
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
                name: user_data.name
            });
        } else {
            await userRepository.changeUser({
                id: user_data.id,
                description: user.description || user_data.description || null,
                image: user.image || null,
                image_filename: user.image_filename || null,
                image_filetype: user.image_filetype || null,
                image_public_id: user.image_public_id || null,
                image_resource_type: user.image_resource_type || null,
                name: user_data.name
            });
        }
    }

    async deleteUserService(current_user_id: string) {
        const currentUserId = this.checkIsUserIdValid(current_user_id);

        const user = await userRepository.getCurrentUserForEdit(currentUserId);
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

        if (user.image && user.image_public_id) {
            operations.push(v2.uploader.destroy(user.image_public_id, { 
                resource_type: user.image_resource_type 
            }));
        }

        if (operations.length > 0) await Promise.all(operations);

        await userRepository.deleteUser(user._id.toString());
    }

    async deleteCurrentUserOldProfile(current_user_id: string) {
        const currentUserId = this.checkIsUserIdValid(current_user_id);
        const user = await userRepository.getCurrentUserForEdit(currentUserId);

        if (!user) throw new BlogApiError(404, "user not found");
        if (!user.image || !user.image_public_id) throw new BlogApiError(404, "image not found");

        await Promise.all([
            v2.uploader.destroy(user.image_public_id, {
                resource_type: user.image_resource_type
            }),
            userRepository.deleteCurrentUserOldProfile(currentUserId)
        ]);
    }

    async getCurrentUser(current_user_id: string) {
        const currentUserId = this.checkIsUserIdValid(current_user_id);
        const user = await userRepository.getCurrentUser(currentUserId);

        if (!user) throw new BlogApiError(404, "user not found");
        
        return {
            created_at: user.createdAt,
            description: user.description,
            email: user.email, 
            profile_picture: {
                public_id: user.image_public_id,
                url: user.image,
            },
            user_id: user._id,
            user_name: user.name
        };
    }
}

const userService = new UserService();

export default userService;
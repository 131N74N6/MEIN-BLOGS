import blogRepository from "./blog.repository";
import mongoose from "mongoose";
import { ApiError } from "../errors/api.error";
import { generateBlogContent } from "../gemini/gemini.service";
import { v2 } from "cloudinary";
import { BlogPaginationIntrf, GenerateBlogIntrf } from "./blog.validation";
import { uploadToCloudinary } from "../cloudinary/cloudinary.service";
import { EditBlogRawIntrf, NewBlogRawIntrf } from "./blog.model";
import { allowedFileType, allowedLanguage, maxFileSize } from "./blog.middleware";

class BlogService {
    private checkIsLanguageValid(language: unknown): string {
        if (!language || typeof language !== "string" || language === "") {
            throw new ApiError(400, "invalid language");
        }

        const trimmed = language.trim();
        if (!allowedLanguage.includes(trimmed)) throw new ApiError(400, "invalid language");

        return trimmed;
    }

    private checkIsIdValid(value: unknown, fieldName: string): string {
        const isNotValid = !value || typeof value !== "string" || !mongoose.isValidObjectId(value);

        if (isNotValid) throw new ApiError(400, `invalid ${fieldName}`);

        return value;
    }

    private checkIsInputValid(value: unknown, fieldName: string, min: number, max: number): string {
        if (typeof value !== "string" || value === undefined || value === "" || value === null) {
            throw new ApiError(400, `invalid ${fieldName}`);
        }

        const trimmed = value.trim();
        if (trimmed.length < min || trimmed.length > max) throw new ApiError(400, `invalid ${fieldName}`);

        return trimmed;
    }

    async createNewBlog(props: NewBlogRawIntrf) {
        const blogContent = this.checkIsInputValid(props.content, "content", 1, 30000);
        const currentUserId = this.checkIsIdValid(props.current_user_id, "current user id");
        const blogLanguage = this.checkIsLanguageValid(props.language);
        const blogTitle = this.checkIsInputValid(props.title, "title", 3, 180);

        if (!props.media) throw new ApiError(400, "file is required to make new blog");

        if (!allowedFileType.includes(props.media.mimetype)) {
            throw new ApiError(400, "this file is not allowed");
        }

        if (props.media.size > maxFileSize) {
            throw new ApiError(400, "file size is too large");
        }

        const newBlogMedia = await uploadToCloudinary({
            file_buffer: props.media.buffer,
            foldername: "blogs_media",
            mimetype: props.media.mimetype,
            original_name: props.media.originalname
        });

        await blogRepository.createNewBlog({
            content: blogContent,
            current_user_id: currentUserId,
            language: blogLanguage,
            media: newBlogMedia,
            title: blogTitle 
        });
    }

    async changeOneBlog(props: EditBlogRawIntrf) {
        const blogContent = this.checkIsInputValid(props.content, "content", 1, 30000);
        const currentUserId = this.checkIsIdValid(props.current_user_id, "current user id");
        const blogLanguage = this.checkIsLanguageValid(props.language);
        const blogTitle = this.checkIsInputValid(props.title, "title", 3, 180);

        const blog = await blogRepository.getBlogById(props.blog_id);
        if (!blog) throw new ApiError(404, "blog not found");

        if (blog.blog_owner_id.toString() !== currentUserId) {
            throw new ApiError(403, "you are not allowed to edit this blog");
        }

        if (props.media) {
            if (!allowedFileType.includes(props.media.mimetype)) {
                throw new ApiError(400, "this file is not allowed");
            }

            if (props.media.size > maxFileSize) {
                throw new ApiError(400, "file size is too large");
            }

            await v2.uploader.destroy(blog.media.public_id, {
                resource_type: blog.media.resource_type
            });

            const newBlogMedia = await uploadToCloudinary({
                file_buffer: props.media.buffer,
                foldername: "blogs_media",
                mimetype: props.media.mimetype,
                original_name: props.media.originalname
            });

            await blogRepository.changeOneBlog({
                blog_id: blog._id.toString(),
                content: blogContent || blog.content,
                current_user_id: currentUserId,
                media: newBlogMedia,
                language: blogLanguage || blog.language,
                title: blogTitle || blog.title
            });
        } else {
            await blogRepository.changeOneBlog({
                blog_id: blog._id.toString(),
                content: blogContent || blog.content,
                current_user_id: currentUserId,
                media: blog.media,
                language: blogLanguage || blog.language,
                title: blogTitle || blog.title
            });
        }
    }

    async deleteAllBlogs(currentUserId: string) {
        const operation = [];
        const blogs = await blogRepository.getAllCurrentUserBlogs(currentUserId);
        if (blogs.length === 0) throw new ApiError(404, "blogs not found");

        if (blogs[0].blog_owner_id.toString() !== currentUserId) {
            throw new ApiError(403, "you are not allowed to delete these blogs");
        }

        const blogsIds = blogs.map(blog => blog._id.toString());
        const blogsMedia = blogs.map(blog => blog.media);
        
        if (blogsMedia.length > 0) {
            const deleteFromCloudinary = blogsMedia.map(blogMedia => {
                return v2.uploader.destroy(blogMedia.public_id, { 
                    resource_type: blogMedia.resource_type 
                });
            });

            operation.push(...deleteFromCloudinary);
        }

        if (operation.length > 0) await Promise.all(operation);
        
        await blogRepository.deleteAllBlogs(blogsIds, currentUserId);
    }

    async deleteChosenBlogs(blogs_ids: string[], current_user_id: string, ) {
        const operations = [];
        const currentUserId = this.checkIsIdValid(current_user_id, "current user id");
        const blogs = await blogRepository.getChosenCurrentUserBlogs(blogs_ids);

        if (blogs.length === 0) throw new ApiError(404, "blog not found");

        const blogsIds = blogs.map((blog) => blog._id.toString());
        const blogsMedia = blogs.map((blog) => blog.media);
        
        if (blogs[0].blog_owner_id.toString() !== currentUserId) {
            throw new ApiError(403, "you are not allowed to delete this blog");
        }

        if (blogsMedia.length > 0) {
            const deleteFromCloudinary = blogsMedia.map((media) => {
                return v2.uploader.destroy(media.public_id, { 
                    resource_type: media.resource_type 
                });
            });

            operations.push(...deleteFromCloudinary);
        }

        if (operations.length > 0) await Promise.all(operations);

        await blogRepository.deleteChosenBlog(blogsIds);
    }

    async generateNewBlog(props: GenerateBlogIntrf) {
        const blogLanguage = this.checkIsLanguageValid(props.language);
        const blogTitle = this.checkIsInputValid(props.title, "title", 3, 180);

        const generatedContent = await generateBlogContent({
            language: blogLanguage,
            title: blogTitle,
        });

        return generatedContent;
    }

    async getAllBlogs(props: Omit<BlogPaginationIntrf, "current_user_id" | "page">) {
        return await blogRepository.getAllBlogsWithPagination(props);
    }

    async getAllCurrentUserBlogs(props: Omit<BlogPaginationIntrf, "page">) {
        const currentUserId = this.checkIsIdValid(props.current_user_id, "current user id");

        return await blogRepository.getAllCurrentUserBlogsWithPagination({
            current_user_id: currentUserId,
            limit: props.limit,
            skip: props.skip
        });
    }

    async getBlogContentById(id: string) {
        const blogId = this.checkIsIdValid(id, "blog id");
        const blogContent = await blogRepository.getBlogById(blogId);

        if (!blogContent) throw new ApiError(404, "blog not found");
        
        return blogContent;
    }
}

const blogService = new BlogService();

export default blogService;
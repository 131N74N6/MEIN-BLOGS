import blogRepository from "../repositories/blog.repository";
import mongoose from "mongoose";
import { ApiError } from "../errors/api.error";
import { generateBlogContent } from "../utils/ai.utility";
import { NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
import { v2 } from "cloudinary";

const allowedFileType = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const allowedLanguage = ["id", "en", "jp", "de"];
const maxFileSize = 5 * 1024 * 1024;

class BlogService {
    private assertBlogMedia(file: Express.Multer.File | undefined): Express.Multer.File {
        if (!file) throw new ApiError(400, "image file is required");

        if (!allowedFileType.includes(file.mimetype)) {
            throw new ApiError(400, "this file is not allowed");
        }

        if (file.size > maxFileSize) throw new ApiError(400, "file size is too large");

        return file;
    }

    private assertLanguage(language: unknown): string {
        if (language === undefined || language === null || language === "") throw new ApiError(400, "invalid language");
        if (typeof language !== "string") throw new ApiError(400, "invalid language");

        const trimmed = language.trim();
        if (!allowedLanguage.includes(trimmed)) throw new ApiError(400, "invalid language");

        return trimmed;
    }

    private assertObjectId(id: unknown, fieldName: string): string {
        if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
            throw new ApiError(400, `invalid ${fieldName}`);
        }

        return id;
    }

    private assertString(value: unknown, fieldName: string, min: number, max: number): string {
        if (typeof value !== "string" || value === undefined || value === "" || value === null) {
            throw new ApiError(400, `invalid ${fieldName}`);
        }

        const trimmed = value.trim();
        if (trimmed.length < min || trimmed.length > max) throw new ApiError(400, `invalid ${fieldName}`);

        return trimmed;
    }

    async createNewBlogService(props: NewBlogIntrf) {
        const blogContent = this.assertString(props.content, "content", 1, 30000);
        const blogMedia = this.assertBlogMedia(props.media);
        const currentUserId = this.assertObjectId(props.current_user_id, "current user id");
        const blogLanguage = this.assertLanguage(props.language);
        const blogTitle = this.assertString(props.title, "title", 3, 180);

        await blogRepository.createNewBlog({
            content: blogContent,
            current_user_id: currentUserId,
            language: blogLanguage,
            media: blogMedia,
            title: blogTitle 
        });
    }

    async deleteAllBlogsService(currentUserId: string) {
        const operation = [];
        const blogs = await blogRepository.getAllCurrentUserBlogs(currentUserId);
        if (blogs.length === 0) throw new ApiError(404, "blogs not found");

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
        
        await Promise.all([
            blogRepository.deleteAllComments(blogsIds),
            blogRepository.deleteAllBlogs(currentUserId)
        ]);
    }

    async deleteOneBlogService(current_user_id: string, id: string) {
        const currentUserId = this.assertObjectId(current_user_id, "current user id");
        const blog = await blogRepository.getBlogById(id);

        if (!blog) throw new ApiError(404, "blog not found");

        if (blog.blog_owner_id.toString() !== currentUserId) {
            throw new ApiError(403, "you are not allowed to delete this blog");
        }

        await Promise.all([
            v2.uploader.destroy(blog.media.public_id, { 
                resource_type: blog.media.resource_type 
            }),
            blogRepository.deleteAllCommentsInOneBlog(id),
            blogRepository.deleteOneBlog(id)
        ]);
    }

    async generateNewBlogService(props: Pick<NewBlogIntrf, 'language' | 'media' | 'title'>) {
        const blogMedia = this.assertBlogMedia(props.media);
        const blogLanguage = this.assertLanguage(props.language);
        const blogTitle = this.assertString(props.title, "title", 3, 180);

        const generatedContent = await generateBlogContent({
            imageBuffer: blogMedia.buffer,
            language: blogLanguage,
            mimeType: blogMedia.mimetype,
            title: blogTitle,
        });

        return generatedContent;
    }

    async getAllBlogsService(props: ShowAllBlogsIntrf) {
        return await blogRepository.getAllBlogsWithPagination(props);
    }

    async getAllCurrentUserBlogsService(props: ShowAllUserBlogsIntrf) {
        const currentUserId = this.assertObjectId(props.current_user_id, "current user id");

        return await blogRepository.getAllCurrentUserBlogsWithPagination({
            current_user_id: currentUserId,
            limit: props.limit,
            skip: props.skip
        });
    }

    async getBlogContentByIdService(id: string) {
        const blogId = this.assertObjectId(id, "blog id");
        const blogContent = await blogRepository.getBlogById(blogId);

        if (!blogContent) throw new ApiError(404, "blog not found");
        
        return blogContent;
    }
}

const blogService = new BlogService();

export default blogService;
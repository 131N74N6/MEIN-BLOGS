import blogRepository from "./repository";
import { generateBlogContent } from "../gemini/service";
import { v2 } from "cloudinary";
import { uploadToCloudinary } from "../cloudinary/service";
import { ObjectId } from "mongodb";
import { TBlogs } from "./model";
import { BlogApiError } from "../error/service";

export const allowedFileType = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const allowedLanguage = ["indonesia", "inggris", "jepang", "jerman"];
export const maxFileSize = 5 * 1024 * 1024;

class BlogService {
    private checkIsIdValid(value: unknown, fieldName: string) {
        const isNotValid = !value || typeof value !== "string" || !ObjectId.isValid(value);
        if (isNotValid) throw new BlogApiError(400, `invalid ${fieldName}`);

        return value;
    }

    private checkIsInputValid(value: unknown, fieldName: string, min: number) {
        if (typeof value !== "string" || !value || value === "") throw new BlogApiError(400, `invalid ${fieldName}`);

        const trimmed = value.trim();
        if (trimmed.length < min) throw new BlogApiError(400, `invalid ${fieldName}`);

        return trimmed;
    }

    async changeOneBlog(props: TBlogs["change_raw"]) {
        const blog = await blogRepository.getBlogContentById(props._id);
        if (!blog) throw new BlogApiError(404, "blog not found");
        
        if (blog.blog_owner_id.toString() !== props.blog_owner_id) {
            throw new BlogApiError(403, "you are not allowed to edit this blog");
        }
        
        const blogContent = props.content !== undefined ? 
        this.checkIsInputValid(props.content, "content", 1) : blog.content;

        const currentUserId = this.checkIsIdValid(props.blog_owner_id, "blog owner id");

        const blogLanguage = props.language !== undefined ? 
        this.checkIsInputValid(props.language, "language", 1) : blog.language;

        const blogTitle = props.title !== undefined ? 
        this.checkIsInputValid(props.title, "title", 1) : blog.title;
        
        
        if (props.media) {
            if (!allowedFileType.includes(props.media.type)) {
                throw new BlogApiError(400, "this file is not allowed");
            }

            if (props.media.size > maxFileSize) {
                throw new BlogApiError(400, "file size is too large");
            }

            const fileArrayBuffer = await props.media.arrayBuffer();
            const fileBuffer = Buffer.from(fileArrayBuffer);

            await v2.uploader.destroy(blog.media.public_id, {
                resource_type: blog.media.resource_type
            });

            const newBlogMedia = await uploadToCloudinary({
                file_buffer: fileBuffer,
                foldername: "blogs_media",
                mimetype: props.media.type,
                original_name: props.media.name
            });

            await blogRepository.changeOneBlog({
                _id: props._id,
                content: blogContent || blog.content,
                blog_owner_id: currentUserId,
                media: newBlogMedia,
                language: blogLanguage || blog.language,
                title: blogTitle || blog.title
            });
        } else {
            await blogRepository.changeOneBlog({
                _id: props._id,
                content: blogContent || blog.content,
                blog_owner_id: currentUserId,
                media: blog.media,
                language: blogLanguage || blog.language,
                title: blogTitle || blog.title
            });
        }
    }

    async createNewBlog(props: TBlogs["add_raw"]) {
        if (!props.media) throw new BlogApiError(400, "file is required to make new blog");
        
        if (!allowedFileType.includes(props.media.type)) {
            throw new BlogApiError(400, "this file is not allowed");
        }
        
        if (!allowedLanguage.includes(props.language)) {
            throw new BlogApiError(400, "this language is not supported yet");
        }

        if (props.media.size > maxFileSize) {
            throw new BlogApiError(400, "file size is too large");
        }

        const blogContent = this.checkIsInputValid(props.content, "content", 1);
        const currentUserId = this.checkIsIdValid(props.blog_owner_id, "blog owner id");
        const blogLanguage = this.checkIsInputValid(props.language, "language", 1);
        const blogTitle = this.checkIsInputValid(props.title, "title", 1);
        
        const fileArrayBuffer = await props.media.arrayBuffer();
        const fileBuffer = Buffer.from(fileArrayBuffer);
        
        const newBlogMedia = await uploadToCloudinary({
            file_buffer: fileBuffer,
            foldername: "blogs_media",
            mimetype: props.media.type,
            original_name: props.media.name
        });

        await blogRepository.createNewBlog({
            content: blogContent,
            blog_owner_id: currentUserId,
            language: blogLanguage,
            media: newBlogMedia,
            title: blogTitle
        });
    }

    async deleteAllBlogs(currentUserId: string) {
        const operation = [];
        const blogs = await blogRepository.getAllCurrentUserBlogs(currentUserId);

        if (blogs.length === 0) return;

        if (blogs[0].blog_owner_id !== currentUserId) {
            throw new BlogApiError(403, "you are not allowed to delete these blogs");
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
        const currentUserId = this.checkIsIdValid(current_user_id, "blog owner id");
        const blogs = await blogRepository.getChosenCurrentUserBlogs(blogs_ids);

        if (blogs.length === 0) return;

        const blogsMedia = blogs.map((blog) => blog.media);
        
        if (blogs[0].blog_owner_id.toString() !== currentUserId) {
            throw new BlogApiError(403, "you are not allowed to delete this blog");
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

        await blogRepository.deleteChosenBlog(blogs_ids);
    }

    async generateNewBlog(props: TBlogs["generate"]) {
        const blogLanguage = this.checkIsInputValid(props.language, "language", 1);
        const blogTitle = this.checkIsInputValid(props.title, "title", 1);

        const generatedContent = await generateBlogContent({
            language: blogLanguage,
            title: blogTitle,
        });

        return generatedContent.contents;
    }

    async getAllBlogsWithPagination(page: Omit<TBlogs["pagination"], "page" | "blog_owner_id">) {
        if (page.title === undefined || page.title === "") {
            return await blogRepository.getAllBlogsWithPagination({ 
                limit: page.limit, skip: page.skip 
            });
        } else {
            return await blogRepository.getAllBlogsWithPagination({ 
                limit: page.limit, skip: page.skip, title: page.title 
            });
        }
    }

    async getAllCurrentUserBlogsWithPagination(page: Omit<TBlogs["pagination"], "page">) {
        const currentUserId = this.checkIsIdValid(page.blog_owner_id, "blog owner id");

        if (page.title === undefined || page.title === "") {
            return await blogRepository.getAllCurrentUserBlogsWithPagination({
                blog_owner_id: currentUserId,
                limit: page.limit,
                skip: page.skip
            });
        } else {
            return await blogRepository.getAllCurrentUserBlogsWithPagination({
                blog_owner_id: currentUserId,
                limit: page.limit,
                skip: page.skip,
                title: page.title
            });
        }
    }

    async getAllCurrentUserBlogsTotal(current_user_id: string) {
        const currentUserId = this.checkIsIdValid(current_user_id, "user id");
        return await blogRepository.getAllCurrentUserBlogsTotal(currentUserId);
    }

    async getBlogContentById(id: string) {
        const blogId = this.checkIsIdValid(id, "blog id");
        const blogContent = await blogRepository.getBlogContentById(blogId);

        if (!blogContent) return;
        return blogContent;
    }
}

const blogService = new BlogService();

export default blogService;
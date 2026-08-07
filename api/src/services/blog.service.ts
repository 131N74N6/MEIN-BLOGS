import blogRepository from "../repositories/blog.repository";
import { generateBlogContent } from "../services/ai.service";
import { NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
import { v2 } from "cloudinary";

class BlogService {
    async createNewBlogService(props: NewBlogIntrf) {
        try {
            if (!props.content && !props.media && !props.title) throw new Error("all fields are required");
            if (!props.content) throw new Error("pleasa provide content");
            if (!props.media) throw new Error("pleasa provide media");
            if (!props.title) throw new Error("pleasa provide title");

            const allowedMedia = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        
            if (!allowedMedia.includes(props.media.mimetype)) {
                throw new Error("only images are allowed such as .jpg, .jpeg, .png, .webp, and .avif");
            }

            await blogRepository.createNewBlog({
                content: props.content,
                current_user_id: props.current_user_id,
                language: props.language,
                media: props.media,
                title: props.title 
            });
        } catch (error) {
            throw error;
        }
    }

    async deleteAllBlogsService(currentUserId: string) {
        try {
            const operation = [];
            const blogs = await blogRepository.getAllCurrentUserBlogs(currentUserId);
            if (blogs.length === 0) throw new Error("blogs not found");

            const blogsIds = blogs.map(blog => blog._id.toString());
            const blogsMedia = blogs.map(blog => blog.media || []);
            
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
        } catch (error) {
            throw error;
        }
    }

    async deleteOneBlogService(id: string) {
        try {
            const blog = await blogRepository.getBlogById(id);
            if (!blog) throw new Error("blog not found");

            await Promise.all([
                v2.uploader.destroy(blog.media.public_id, { 
                    resource_type: blog.media.resource_type 
                }),
                blogRepository.deleteAllCommentsInOneBlog(id)
            ]);
        } catch (error) {
            throw error;
        }
    }

    async generateNewBlogService(props: Pick<NewBlogIntrf, 'language' | 'media' | 'title'>) {
        try {
            const generatedContent = await generateBlogContent({
                imageBuffer: props.media?.buffer!,
                language: props.language,
                mimeType: props.media?.mimetype!,
                title: props.title,
            });

            return generatedContent;
        } catch (error) {
            throw error;    
        }
    }

    async getAllBlogsService(props: ShowAllBlogsIntrf) {
        return await blogRepository.getAllBlogsWithPagination(props);
    }

    async getAllCurrentUserBlogsService(props: ShowAllUserBlogsIntrf) {
        return await blogRepository.getAllCurrentUserBlogsWithPagination(props);
    }

    async getBlogContentByIdService(id: string) {
        try {
            const blogContent = await blogRepository.getBlogById(id);
            if (!blogContent) throw new Error("blog not found");
            
            return blogContent;
        } catch (error) {
            throw error;
        }
    }
}

const blogService = new BlogService();

export default blogService;
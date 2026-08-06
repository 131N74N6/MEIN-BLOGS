import mongoose, { Schema, Types } from "mongoose";

export interface BlogIntrf {
    blog_owner_id: Types.ObjectId;
    blog_owner: string;
    content: string;
    language: string;
    media: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
    title: string;
}

export interface NewBlogIntrf {
    current_user_id: string;
    content: string;
    language: string;
    media: Express.Multer.File | undefined;
    title: string;
}

export interface ShowAllBlogsIntrf {
    limit: number;
    page: number;
    skip: number;
}

export interface ShowAllUserBlogsIntrf extends ShowAllBlogsIntrf {
    current_user_id: string;
}

const blogSchema = new Schema<BlogIntrf>({
    blog_owner_id: { type: Schema.Types.ObjectId, required: true },
    blog_owner: { type: String, required: true },
    content: { type: String, required: true },
    language: { type: String },
    media: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
    title: { type: String, required: true }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Blogs = mongoose.model<BlogIntrf>("blogs", blogSchema, "blogs");
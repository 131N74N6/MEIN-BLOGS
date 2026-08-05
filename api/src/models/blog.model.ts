import mongoose, { Schema, Types } from "mongoose";

export interface IBlog {
    blog_owner_id: Types.ObjectId;
    blog_owner: string;
    content: string;
    media: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
    role: string;
}

const blogSchema = new Schema<IBlog>({
    blog_owner_id: { type: Schema.Types.ObjectId, required: true },
    blog_owner: { type: String, required: true },
    content: { type: String, required: true },
    media: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
    role: { type: String, required: true },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Blogs = mongoose.model<IBlog>("blogs", blogSchema, "blogs");
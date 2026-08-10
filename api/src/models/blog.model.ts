import mongoose, { Schema, Types } from "mongoose";

export interface BlogIntrf {
    blog_owner_id: Types.ObjectId;
    blog_owner_profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
    blog_owner_name: string;
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
    viewers: {
        user_id: Types.ObjectId;
        username: string;
        profile_picture: {
            filename: string;
            filetype: string;
            public_id: string;
            resource_type: string;
            url: string;
        } | null;
        blog_id: Types.ObjectId;
        blog_title: string;
    }[];
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
    skip: number;
}

export interface ShowAllUserBlogsIntrf extends ShowAllBlogsIntrf {
    current_user_id: string;
}

export interface BlogViewerIntrf extends ShowAllBlogsIntrf {
    blog_id: string;
}

const blogSchema = new Schema<BlogIntrf>({
    language: { type: String },
    title: { type: String, required: true },
    media: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
    content: { type: String, required: true },
    blog_owner_id: { type: Schema.Types.ObjectId, required: true },
    blog_owner_profile_picture: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
    blog_owner_name: { type: String, required: true },
    viewers: [{
        user_id: { type: Schema.Types.ObjectId },
        username: { type: String },
        profile_picture: {
            filename: { type: String },
            filetype: { type: String },
            public_id: { type: String },
            resource_type: { type: String },
            url: { type: String }
        }
    }]
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Blogs = mongoose.model<BlogIntrf>("blogs", blogSchema, "blogs");
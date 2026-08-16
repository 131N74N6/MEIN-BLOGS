import mongoose, { Schema, Types } from "mongoose";

export interface ViewerIntrf {
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
}

export interface VisitBlogIntrf {
    blog_id: string;
    current_user_id: string;
}

export interface ViewerPaginationIntrf {
    blog_id: string;
    limit: number;
    skip: number;
}

const viewersCollectionSchema = new Schema<ViewerIntrf>({
    user_id: { type: Schema.Types.ObjectId },
    username: { type: String },
    profile_picture: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
    blog_id: { type: Schema.Types.ObjectId },
    blog_title: { type: String }
});

export const Viewers = mongoose.model<ViewerIntrf>("viewers", viewersCollectionSchema, "viewers");
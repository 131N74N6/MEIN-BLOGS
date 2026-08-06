import mongoose, { Schema, Types } from "mongoose";

export interface IComment {
    blog_id: Types.ObjectId;
    text: string;
    user_id: Types.ObjectId;
    username: string;
    profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
}

export interface ShowCommentIntrf {
    blog_id: string;
    limit: number;
    skip: number;
}

const commentSchema = new Schema<IComment>({
    blog_id: { type: Schema.Types.ObjectId, required: true },
    profile_picture: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
    text: { type: String },
    user_id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Comments = mongoose.model<IComment>("comments", commentSchema, "comments");
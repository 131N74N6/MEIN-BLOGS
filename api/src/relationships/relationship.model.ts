import mongoose, { Schema, Types } from "mongoose";

export interface RelationshipIntrf {
    user_id: Types.ObjectId;
    username: string;
    profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
    followed_user_id: Types.ObjectId;
}

export interface UserRelationshipIntrf {
    followed_user_id: string;
    limit: number;
    skip: number;
    user_id: string;
}

const relationshipsCollectionSchema = new Schema<RelationshipIntrf>({
    user_id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
    profile_picture: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
    followed_user_id: { type: Schema.Types.ObjectId, required: true }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

export const Relationships = mongoose.model("relationships", relationshipsCollectionSchema, "relationships");
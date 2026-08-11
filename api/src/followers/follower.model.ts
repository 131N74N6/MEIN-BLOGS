import mongoose, { Schema, Types } from "mongoose";

export interface FollowersIntrf {
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

export interface FollowersUserIntrf {
    current_user_id: string;
    followed_user_id: string;
    limit: number;
    skip: number;
}

const followersSchema = new Schema<FollowersIntrf>({
    user_id: { required: true },
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

export const Followers = mongoose.model("followers", followersSchema, "followers");
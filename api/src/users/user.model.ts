import mongoose, { Schema } from "mongoose";

export interface ProfilePictureIntrf {
    filename: string;
    filetype: string;
    public_id: string;
    resource_type: string;
    url: string;
}

export interface ChangeUserIntrf {
    currentUserId: string;
    selectedImage?: Express.Multer.File;
    username?: string;
}

export interface UserIntrf {
    email: string;
    password: string;
    profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
    username: string;
}

const userSchema = new Schema<UserIntrf>({
    email: { 
        lowercase: true,
        trim: true,
        type: String, 
        required: true, 
        unique: true
    },
    password: { 
        type: String, 
        required: true 
    },
    profile_picture: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
    username: { 
        trim: true,
        type: String, 
        required: true, 
        unique: true
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Users = mongoose.model<UserIntrf>("users", userSchema, "users");
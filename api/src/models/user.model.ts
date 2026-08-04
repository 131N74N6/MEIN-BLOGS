import mongoose, { Schema } from "mongoose";

export interface IUser {
    email: string;
    password: string;
    role: string;
    username: string;
    profile_picture: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    }
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    username: { type: String, required: true },
    profile_picture: {
        filename: { type: String },
        filetype: { type: String },
        public_id: { type: String },
        resource_type: { type: String },
        url: { type: String }
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Users = mongoose.model<IUser>("users", userSchema, "users");
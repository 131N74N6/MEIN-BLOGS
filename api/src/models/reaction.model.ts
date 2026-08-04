import mongoose, { Schema, Types } from "mongoose";

export interface IReaction {
    blog_id: Types.ObjectId;
    reaction: string;
    role: string;
    user_id: Types.ObjectId;
    username: string;
}

const reactionSchema = new Schema<IReaction>({
    blog_id: { type: Schema.Types.ObjectId, required: true },
    reaction: { type: String, required: true },
    role: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

export const Reactions = mongoose.model<IReaction>("reactions", reactionSchema, "reactions");
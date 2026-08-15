import { z } from "zod";

export const followedUserIdSchema = z
.string()
.regex(/^[0-9a-fA-F]{24}$/, "invalid data");

export const userIdSchema = z
.string()
.regex(/^[0-9a-fA-F]{24}$/, "invalid data");

export const usernameSchema = z
.string()
.trim()
.min(3, "username is too short")
.max(30, "username is too long")
.regex(/^[a-zA-Z0-9_]+$/, "username can only have letters, numbers, and underscores");

export const followerPaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().max(32).default(16)
}).transform((data) => ({
    page: data.page,
    limit: data.limit,
    skip: (data.page - 1) * data.limit
}));
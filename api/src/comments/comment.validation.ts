import { z } from "zod";

export const commentSchema = z
.string()
.trim()
.min(1, "blog content mustn't empty");

export const commentPaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().max(32).default(16)
}).transform((data) => ({
    page: data.page,
    limit: data.limit,
    skip: (data.page - 1) * data.limit
}));
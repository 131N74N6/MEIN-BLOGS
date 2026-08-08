import { z } from "zod";

export const language = ["id", "en", "jp", "de"] as const;

export const objectIdSchema = z
.string()
.regex(/^[0-9a-fA-F]{24}$/, "invalid object id");

export const titleSchema = z
.string()
.trim()
.min(3, "blog title is too short")
.max(180, "blog title is too long");

export const contentSchema = z
.string()
.trim()
.min(1, "blog content mustn't empty")
.max(30000, "blog content is too long");

export const languageSchema = z
.enum(language);

export const createBlogSchema = z.object({
    content: contentSchema,
    language: languageSchema,
    title: titleSchema
});

export const generateBlogSchema = z.object({
    language: languageSchema,
    title: titleSchema
});

export const blogIdParamSchema = z.object({
    blog_id: objectIdSchema
});

export const blogPaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().max(32).default(16)
}).transform((data) => ({
    page: data.page,
    limit: data.limit,
    skip: (data.page - 1) * data.limit
}));

export type BlogPaginationIntrf = z.infer<typeof blogPaginationSchema>;
export type CreateBlogBody = z.infer<typeof createBlogSchema>;
export type GenerateBlogBody = z.infer<typeof generateBlogSchema>;
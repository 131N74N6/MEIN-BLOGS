import { z } from "zod";

const allowedFileType = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxFileSize = 5 * 1024 * 1024;

export const createBlogSchema = z.object({
    content: z
    .string()
    .trim()
    .min(1, "blog content mustn't empty")
    .max(30000, "blog content is too long"),

    media: z
    .custom<Express.Multer.File | undefined>((file) => file !== undefined && file !== null, {
        error: 'file is required',
    })
    .refine((file) => file?.size! < maxFileSize, "max file size is 5mb")
    .refine((file) => allowedFileType.includes(file?.mimetype!), "This file is not supported.")
    .optional(),

    language: z
    .string()
    .min(1, "please select the language"),

    title: z
    .string()
    .trim()
    .min(3, "blog title is too short")
    .max(180, "blog title is too long")
});

export const generateBlogSchema = z.object({
    language: z
    .string()
    .min(1, "please select the language"),

    title: z
    .string()
    .trim()
    .min(3, "blog title is too short")
    .max(180, "blog title is too long")
});

export const blogIdParamSchema = z
.string()
.regex(/^[0-9a-fA-F]{24}$/, "invalid object id");

export const blogPaginationSchema = z.object({
    current_user_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "invalid object id"),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().max(32).default(16)
}).transform((data) => ({
    current_user_id: data.current_user_id,
    page: data.page,
    limit: data.limit,
    skip: (data.page - 1) * data.limit
}));

export type BlogPaginationIntrf = z.infer<typeof blogPaginationSchema>;
export type GenerateBlogIntrf = z.infer<typeof generateBlogSchema>;
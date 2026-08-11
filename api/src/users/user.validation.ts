import { z } from "zod";

export const usernameSchema = z
.string()
.trim()
.min(3, "username is too short")
.max(30, "username is too long")
.regex(/^[a-zA-Z0-9_]+$/, "username can only have letters, numbers, and underscores");

export const passwordSchema = z
.string()
.min(8, "password is too short")
.max(72, "password is too long");

export const emailSchema = z
.email()
.trim()
.toLowerCase()
.max(254, "email is too long")
.regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "invalid email");

export const changeUserSchema = z.object({
    username: usernameSchema.optional()
});

export const signInSchema = z.object({
    username: usernameSchema,
    password: passwordSchema
});

export const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    username: usernameSchema
});

export type ChangeUserInput = z.infer<typeof changeUserSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
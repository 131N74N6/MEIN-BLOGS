import { z } from "zod";

export const changeUserSchema = z.object({
    username: z
    .string()
    .trim()
    .min(1, "username is required")
    .min(3, "username is too short")
    .max(30, "username is too long")
    .regex(/^[a-zA-Z0-9_]+$/, "username can only have letters, numbers, and underscores")
    .optional()
});

export const signInSchema = z.object({
    username: z
    .string()
    .trim()
    .min(1, "username is required")
    .min(3, "username is too short")
    .max(30, "username is too long")
    .regex(/^[a-zA-Z0-9_]+$/, "username can only have letters, numbers, and underscores"),

    password: z
    .string()
    .min(1, "password is required")
    .min(8, "password is too short")
    .max(72, "password is too long")
});

export const signUpSchema = z.object({
    email: z
    .email()
    .trim()
    .toLowerCase()
    .max(254, "email is too long")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "invalid email"),

    password: z
    .string()
    .min(1, "password is required")
    .min(8, "password is too short")
    .max(72, "password is too long"),

    username: z
    .string()
    .trim()
    .min(1, "username is required")
    .min(3, "username is too short")
    .max(30, "username is too long")
    .regex(/^[a-zA-Z0-9_]+$/, "username can only have letters, numbers, and underscores")
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
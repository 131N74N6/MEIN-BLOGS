import jwt from "@elysiajs/jwt";
import { Elysia } from "elysia";

export const jwtPlugin = new Elysia({ name: "jwt" })
.use(jwt({
    name: "jwt",
    secret: process.env.JWT_SECRET || "super-secret-jwt-key",
    exp: "7d"
}));
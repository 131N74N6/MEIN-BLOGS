import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
    legacyHeaders: false,
    limit: 50,
    message: { message: "too many authentication attempts, please try again later" },
    standardHeaders: true,
    windowMs: 20 * 60 * 1000, // 20 minutes
});
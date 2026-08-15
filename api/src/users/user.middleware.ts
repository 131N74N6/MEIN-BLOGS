import multer from "multer";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        user_id: string;
        username: string;
    }
}

export interface CustomJwtPayload extends JwtPayload {
    user_id: string;
    username: string;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
    const currentToken = req.cookies?.token;
    if (!currentToken) return res.status(401).json({ message: "token is required" });

    jwt.verify(process.env.JWT_TOKEN || "my_secret_key", (error: any, decode: any) => {
        if (error) return res.status(403).json({ message: "invalid access token" });
        const payload = decode as CustomJwtPayload;

        req.user = {
            user_id: payload.user_id,
            username: payload.username
        }
        
        next();
    });
}

const storage = multer.memoryStorage();

function fileFilter(_: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    const allowedFileType = ["image/jpeg", "image/png", "image/webp", "image/avif"];

    if (!allowedFileType.includes(file.mimetype)) {
        callback(new Error("only .jpg, .png, .avif, and .webp image file are allowed"));
    } else {
        callback(null, true);
    }
}

export const verifyProfilePicture = multer({ storage, fileFilter }).single("profile_picture");
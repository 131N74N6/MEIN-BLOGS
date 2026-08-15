import multer from "multer";
import { Request } from "express";

const storage = multer.memoryStorage();

function fileFilter(_: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    const allowedFileType = ["image/jpeg", "image/png", "image/webp", "image/avif"];

    if (!allowedFileType.includes(file.mimetype)) {
        callback(new Error("only .jpg, .png, .avif, and .webp image file are allowed"));
    } else {
        callback(null, true);
    }
}

export const verifyBlogFile = multer({ storage, fileFilter }).single("blog_media");
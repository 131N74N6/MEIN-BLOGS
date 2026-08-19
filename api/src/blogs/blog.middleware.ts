import multer from "multer";
import { Request } from "express";

export const allowedFileType = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const allowedLanguage = ["id", "en", "jp", "de"];
export const maxFileSize = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

function fileFilter(_: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    if (!allowedFileType.includes(file.mimetype)) {
        callback(new Error("only .jpg, .png, .avif, and .webp image file are allowed"));
    } else {
        callback(null, true);
    }
}

export const verifyBlogFile = multer({ storage, fileFilter, limits: { fileSize: maxFileSize } })
.single("blog_media");
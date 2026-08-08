import { Response } from "express";

export function errorHandling(res: Response, error: unknown) {
    if (error instanceof ApiError) {
        if (error.statusCode >= 500) {
            return res.status(error.statusCode).json({ message: "something went wrong" });
        }
        return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: "something went wrong" });
}

export class ApiError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    }
}
// src/errors/handler.ts
import { Elysia, ValidationError } from "elysia";
import { BlogApiError } from "./message";

// Definisikan custom error untuk Elysia
export class CustomError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public field?: string
    ) {
        super(message);
    }
}

export function setupErrorHandler(app: Elysia) {
    // 1. Daftarkan error kustom ke Elysia
    return app.error({ BlogApiError })
        
    // 2. Handler global untuk semua error
    .onError(({ code, error, set }) => {
        // A. Tangani BlogApiError dari service/controller
        if (error instanceof BlogApiError) {
            set.status = error.statusCode;
            return {
                success: false,
                message: error.message,
                field: error.field ?? null
            };
        }

        // B. Tangani validasi TypeBox (schema) yang gagal
        if (code === "VALIDATION") {
            set.status = 400;
            const validationError = error as ValidationError;
            return {
                success: false,
                message: validationError.message || "invalid input data",
                field: null
            };
        }

        // C. Tangani error tidak terduga (500)
        set.status = 500;
        return {
            success: false,
            message: "something went wrong",
            field: null
        };
    });
}
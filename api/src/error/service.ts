import { Elysia } from "elysia";

export class BlogApiError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "BlogApiError";
    }
}

export function setupErrorHandler(app: Elysia) {
    return app.error({ BlogApiError })
    .onError(({ code, error, set }) => {

        if (code === 'BlogApiError' || error instanceof BlogApiError) {
            const apiError = error as BlogApiError;
            set.status = apiError.statusCode || 400;
            return { 
                success: false, 
                message: apiError.message 
            };
        }

        if (code === 'VALIDATION') {
            set.status = 400;
        
            const firstError = error.all?.[0];
            if (!firstError) return { success: false, message: "invalid required data" }
    
            const fieldName = firstError.path?.replace(/^\//, '') || 'unknown';
            const customSchemaError = firstError.schema?.error;
    
            if (customSchemaError) {
                return { success: false, message: customSchemaError, details: error.all };
            }
    
            const defaultMessage = firstError.message || "something went wrong";
            let finalMessage = defaultMessage;

            if (defaultMessage.includes("Expected kind 'File'") || defaultMessage.includes("Expected File")) {
                finalMessage = `${fieldName} file is required or invalid.`;
            } else if (defaultMessage.includes("Expected string") || defaultMessage.includes("Required property")) {
                finalMessage = `${fieldName} is required.`;
            } else if (defaultMessage.includes("Expected number")) {
                finalMessage = `${fieldName} must be a number.`;
            } else if (defaultMessage.includes("minLength") || defaultMessage.includes("maxLength")) {
                finalMessage = `${fieldName} length is invalid.`;
            } else if (defaultMessage.includes("pattern")) {
                finalMessage = `${fieldName} format is invalid.`;
            } else if (!finalMessage) {
                finalMessage = `${fieldName} is invalid.`;
            }

            return { success: false, message: finalMessage, details: error.all };
        }

        if (code === 'NOT_FOUND') {
            set.status = 404;
            return { success: false, message: error.message || "resource not found" };
        }
        
        set.status = 500;
        console.error("Unhandled Server Error:", error);
        return { success: false, message: "something went wrong" };
    });
}
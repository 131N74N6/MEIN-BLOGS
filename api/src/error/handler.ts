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

        switch (code) {
            case 'NOT_FOUND':
                set.status = 404;
                return { success: false, message: error.message };
            case 'VALIDATION':
                set.status = 400;

                const firstError = error.all && error.all.length > 0 ? error.all[0] : null;
                let customMessage = "invalid required data";

                if (firstError) {
                    const fieldName = firstError.path.replace('/', '');
                    const cloudinaryError = firstError.message.includes("public id") || 
                    firstError.message.includes("resource type") || 
                    firstError.message.includes("url");
                    
                    if (firstError.message.includes("Expected kind 'File'") || firstError.message.includes("Expected Object")) {
                        customMessage = `${fieldName} field is required.`;
                    } else if (cloudinaryError) {
                        console.error("⚠️ Cloudinary Schema Validation Error:", firstError.message);
                        customMessage = "failed to process your file. try again later";
                    } else if (firstError.message.includes("Expected string")) {
                        customMessage = `${fieldName} field is required.`;
                    } else {
                        customMessage = firstError.message;
                    }
                }
                return { success: false, message: customMessage, details: error.all };
            default:
                set.status = 500;
                console.error(error);
                return { success: false, message: "something went wrong" };
        }
    });
}
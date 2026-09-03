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

// import { Elysia } from "elysia";

// export class BlogApiError extends Error {
//     public readonly statusCode: number;

//     constructor(statusCode: number, message: string) {
//         super(message);
//         this.statusCode = statusCode;
//         this.name = "BlogApiError";
//     }
// }

// export function setupErrorHandler(app: Elysia) {
//     return app.error({ BlogApiError })
//     .onError(({ code, error, set }) => {

//         if (code === 'BlogApiError' || error instanceof BlogApiError) {
//             const apiError = error as BlogApiError;
//             set.status = apiError.statusCode || 400;
//             return { 
//                 success: false, 
//                 message: apiError.message 
//             };
//         }

//         switch (code) {
//             case 'NOT_FOUND':
//                 set.status = 404;
//                 return { success: false, message: error.message || "resource not found" };
                
//             case 'VALIDATION': {
//                 set.status = 400;
//                 // Elysia menyimpan array error TypeBox di properti 'all'
//                 const validationErrors = error.all || [];
                
//                 // BEST PRACTICE: Ekstrak pesan kustom dari schema.error 
//                 // (yang didefinisikan di model.ts, contoh: error: "invalid content")
//                 const extractedMessages = validationErrors.map((err: any) => {
//                     // 1. Prioritas Utama: Pesan kustom dari schema (model.ts)
//                     if (err.schema?.error && typeof err.schema.error === 'string') {
//                         return err.schema.error;
//                     }
                    
//                     // 2. Prioritas Kedua: Pesan error.message (jika Elysia meng-override-nya)
//                     if (err.message && !err.message.startsWith("Expected ")) {
//                         return err.message;
//                     }
                    
//                     // 3. Fallback untuk File/Object yang tidak memiliki custom error
//                     if (err.message?.includes("Expected kind 'File'") || err.message?.includes("Expected Object")) {
//                         const fieldName = err.path?.replace('/', '') || 'file';
//                         return `${fieldName} is required`;
//                     }
                    
//                     // 4. Fallback default menggunakan nama field
//                     const fieldName = err.path?.replace('/', '') || 'data';
//                     return `${fieldName} is invalid`;
//                 });

//                 // Hapus duplikat pesan (misal: "invalid user" muncul 2x)
//                 const uniqueMessages = [...new Set(extractedMessages)];
                
//                 // Gabungkan dengan titik spasi agar rapi dan terbaca di UI Toast/Alert
//                 const finalMessage = uniqueMessages.length > 0 
//                     ? uniqueMessages.join('. ') 
//                     : "invalid required data";

//                 return { 
//                     success: false, 
//                     message: finalMessage,
//                     // Kirim details mentah agar client bisa parsing lebih lanjut jika butuh list
//                     details: validationErrors 
//                 };
//             }
                
//             default:
//                 set.status = 500;
//                 console.error("Unhandled Server Error:", error);
//                 return { success: false, message: "something went wrong on our end" };
//         }
//     });
// }
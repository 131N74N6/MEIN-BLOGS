import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "../mongodb/service";

export const authService = betterAuth({
    database: mongodbAdapter(db()),
    secret: import.meta.env.BETTER_AUTH_SECRET,
    baseURL: import.meta.env.BETTER_AUTH_URL,
    trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],

    // Enable email/password authentication
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128
    },

    // Session configuration
    session: {
        expiresIn: 60 * 60 * 24 * 7,    // 7 days
        updateAge: 60 * 60 * 24,         // Update every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5                  // Cache 5 minutes
        }
    },

    // Custom user fields
    user: {
        additionalFields: {
            description: {
                type: "string",
                required: false
            },
            image_public_id: {
                type: "string",
                required: false
            },
            image_filename: {
                type: "string",
                required: false
            },
            image_filetype: {
                type: "string",
                required: false
            },
            image_resource_type: {
                type: "string",
                required: false
            }
        }
    },

    databaseHooks: {
        session: {
            delete: {
                after: async (session) => {
                    if (session?.id) {
                        const database = db();
                        await database.collection("session").deleteOne({ id: session.id });
                    }
                }
            }
        }
    },

    advanced: {
        database: {
            generateId: false
        },
        cookies: {
            session_token: {
                attributes: {
                    secure: process.env.NODE_ENV === "production", // Hanya kirim via HTTPS di produksi
                    httpOnly: true,  // Mencegah akses via JavaScript (XSS protection)
                    sameSite: "lax", // Mencegah CSRF
                }
            }
        }
    }
});
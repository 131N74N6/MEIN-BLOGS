import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { BlogGeneratorIntrf, GeneratedResultIntrf } from "./model";
import { BlogApiError } from "../error/service";

const aiApiKey = process.env.AI_API_KEY;
const aiModel = process.env.AI_MODEL || "gemini-2.5-flash";
const ai = new GoogleGenAI({ apiKey: aiApiKey });

export async function generateBlogContent(props: BlogGeneratorIntrf): Promise<GeneratedResultIntrf> {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: aiModel,
            contents: [{
                role: "user",
                parts: [
                    { 
                        text: `
                            Buatkan sebuah blog menggunakan bahasa ${props.language} 
                            dengan judul "${props.title} memakai istilah yang mudah 
                            dipahami sehingga dapat dibaca dan dipahami oleh semua kalangan".
                            Pastikan tidak menyampaikan informasi yang bersifat spam atau menyesatkan 
                            serta fakta yang disampaikan harus berasal dari sumber terpercaya.
                        ` 
                    }
                ]
            }]
        });

        const generatedBlogContent = response.text;

        if (!generatedBlogContent || generatedBlogContent.trim().length === 0) {
            throw new BlogApiError(500, "AI returned an empty response. Please try a different title.");
        }

        return { contents: generatedBlogContent }
    } catch (error: any) {
        if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key not valid")) {
            throw new BlogApiError(500, "AI service is currently unavailable. Please try again later.");
        }

        if (error.name === "AbortError" || error.name === "TimeoutError") {
            throw new BlogApiError(504, "AI request timed out. Please try again.");
        }

        if (error.message?.includes("MODEL_NOT_FOUND") || error.message?.includes("not found")) {
            throw new BlogApiError(500, "AI service configuration error");
        }

        if (error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
            throw new BlogApiError(429, "AI usage limit reached. Please wait a moment and try again.");
        }

        if (error.message?.includes("SAFETY") || error.message?.includes("blocked")) {
            throw new BlogApiError(400, "Content generation blocked due to safety guidelines. Please adjust your title or try a different topic.");
        }

        if (error.message?.includes("timeout") || error.message?.includes("ETIMEDOUT")) {
            throw new BlogApiError(504, "AI analysis timed out");
        }

        if (error.message?.includes("ECONNREFUSED") || error.message?.includes("ENOTFOUND")) {
            throw new BlogApiError(503, "AI service is temporarily unreachable.");
        }

        if (error.message?.includes("PERMISSION_DENIED")) {
            throw new BlogApiError(403, "Access denied.");
        }

        throw new BlogApiError(500, "Failed to generate blog content. Please try again.");
    }
}
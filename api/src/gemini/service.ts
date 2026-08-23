import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { BlogGeneratorIntrf, GeneratedResultIntrf } from "./model";

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
            throw new Error('No analysis result returned from AI');
        }

        return { contents: generatedBlogContent }
    } catch (error: any) {
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
            throw new Error('AI API authentication failed: Invalid API key. Check AI_API_KEY environment variable.');
        }

        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            throw new Error('AI API request timeout. Please try again');
        }

        if (error.message?.includes('MODEL_NOT_FOUND') || error.message?.includes('not found')) {
            throw new Error(`AI model '${aiModel}' not found. Check AI_MODEL environment variable.`);
        }

        if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('AI API quota exceeded. Please wait a moment and try again.');
        }

        if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
            throw new Error('AI analysis blocked due to safety concerns.');
        }

        if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
            throw new Error('AI analysis timed out. Please try with a smaller image.');
        }

        if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
            throw new Error('Check your internet connection.');
        }

        if (error.message?.includes('PERMISSION_DENIED')) {
            throw new Error('Access denied. Your API key may not have permission to use this model.');
        }

        throw new Error(`AI analysis failed: ${error.message || 'Unknown error'}`);
    }
}
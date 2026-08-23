export class BlogApiError extends Error {
    public readonly statusCode: number;
    public readonly field?: string;

    constructor(statusCode: number, message: string, field?: string) {
        super(message);
        this.statusCode = statusCode;
        this.field = field;
        this.name = "BlogApiError";
    }
}
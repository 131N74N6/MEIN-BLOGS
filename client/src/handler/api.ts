const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    details?: unknown;
}

export class ApiError extends Error {
    public readonly details: unknown;
    
    constructor(message: string, details?: unknown) {
        super(message);
        this.name = "ApiError";
        this.details = details;
    }
}

// 3. Fungsi pembantu untuk memproses respons dari fetch
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let result: ApiResponse<T>;
    
    try {
        // Ambil data JSON dari server
        result = await response.json();
    } catch {
        // Antisipasi jika server crash parah dan mengembalikan HTML/Teks kosong, bukan JSON
        throw new ApiError(response.ok ? "Failed to parse response" : "internal server error");
    }

    // JIKA STATUS HTTP BUKAN 2xx ATAU BACKEND MENYATAKAN GAGAL
    if (!response.ok || !result.success) {
        // Lemparkan ApiError khusus dengan membawa message dan details asli dari backend
        throw new ApiError(
            result.message || "something went wrong", 
            result.details
        );
    }

    return result;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: "include",
        headers: { 
            "Content-Type": "application/json", 
            ...options.headers 
        },
        ...options
    });

    return handleResponse<T>(response);
}

export async function apiUpload<T>(endpoint: string, formData: FormData, method: string = "POST"): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: "include",
        method: method,
        body: formData
    });

    return handleResponse<T>(response);
}
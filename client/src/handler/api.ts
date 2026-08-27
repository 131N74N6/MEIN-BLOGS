const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    field?: string | null;
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

    const result: ApiResponse<T> = await response.json();

    // Jika response tidak ok, lempar error dengan pesan dari backend
    if (!response.ok || !result.success) {
        throw new Error(result.message || "something went wrong");
    }

    return result;
}

// Helper khusus untuk FormData (upload file)
export async function apiUpload<T>(endpoint: string, formData: FormData, method: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        credentials: "include",
        body: formData, // Jangan set Content-Type, biarkan browser
        method: method
    });

    const result: ApiResponse<T> = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "upload failed");
    }

    return result;
}
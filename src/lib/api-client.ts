const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

type RequestOptions = RequestInit & {
    json?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { json, headers, ...rest } = options;

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            ...(headers || {}),
        },
        body: json !== undefined ? JSON.stringify(json) : rest.body,
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export const apiClient = {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, json?: unknown) => request<T>(path, { method: "POST", json }),
    put: <T>(path: string, json?: unknown) => request<T>(path, { method: "PUT", json }),
    patch: <T>(path: string, json?: unknown) => request<T>(path, { method: "PATCH", json }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
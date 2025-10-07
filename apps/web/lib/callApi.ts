import { ChatSDKError, ErrorCode } from "./errors";

export const fetcher = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        const { code, cause } = await response.json();
        throw new ChatSDKError(code as ErrorCode, cause);
    }

    return response.json();
};

export async function fetchWithErrorHandlers(
    input: RequestInfo | URL,
    init?: RequestInit,
) {
    try {
        const response = await fetch(input, { ...init, credentials: "include" });

        if (!response.ok) {
            const { code, cause } = await response.json();
            throw new ChatSDKError(code as ErrorCode, cause);
        }

        return response;
    } catch (error: unknown) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new ChatSDKError('offline:chat');
        }

        throw error;
    }
}
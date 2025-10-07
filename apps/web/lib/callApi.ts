import { ChatSDKError, ErrorCode } from "./errors";

export const fetcher = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, { ...init, credentials: "include" });

    console.log(response.ok);
    if (!response.ok) {
        const { code, cause } = await response.json();
        throw new ChatSDKError(code as ErrorCode, cause);
    }

    const res = await response.json();
    console.log(res);
    return res;
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
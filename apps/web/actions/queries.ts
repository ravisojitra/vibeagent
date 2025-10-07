'use server'
import { ChatSDKError } from "@/lib/errors";
import { VisibilityType } from "@/types/chat";
import { cookies } from "next/headers";
import { fetcher } from "@/lib/callApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function getChatById({ id }: { id: string }) {
  try {
    const chat = await fetcher(`${API_URL}/api/chat/${id}`);
    return chat;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await fetcher(`${API_URL}/api/chat/${id}/messages`);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  try {
    return await fetcher(`${API_URL}/api/chat/${chatId}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility }),
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await fetcher(`${API_URL}/api/message/${id}`);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  try {
    return await fetcher(`${API_URL}/api/message/${id}/trailing`, {
      method: 'DELETE',
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}
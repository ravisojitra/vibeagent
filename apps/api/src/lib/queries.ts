import { asc, eq } from "drizzle-orm";
import { db } from "./db";
import { ChatSDKError } from "./errors";
import { chat, message, stream, type DBMessage } from "./schema";

export async function createStreamId({
    streamId,
    chatId,
}: {
    streamId: string;
    chatId: string;
}) {
    try {
        await db
            .insert(stream)
            .values({ id: streamId, chatId, createdAt: new Date() });
    } catch (_error) {
        throw new ChatSDKError(
            "bad_request:database",
            "Failed to create stream id"
        );
    }
}

export async function getChatById({ id }: { id: string }) {
    try {
        const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
        if (!selectedChat) {
            return null;
        }

        return selectedChat;
    } catch (_error) {
        throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
    }
}

export async function getMessagesByChatId({ id }: { id: string }) {
    try {
        return await db
            .select()
            .from(message)
            .where(eq(message.chatId, id))
            .orderBy(asc(message.createdAt));
    } catch (_error) {
        throw new ChatSDKError(
            "bad_request:database",
            "Failed to get messages by chat id"
        );
    }
}

export async function saveChat({
    id,
    userId,
    title,
    visibility,
}: {
    id: string;
    userId: string;
    title: string;
    visibility: "public" | "private";
}) {
    try {
        return await db.insert(chat).values({
            id,
            createdAt: new Date(),
            userId,
            title,
            visibility,
            projectId: "TODO : get project id",
            commitHash: "TODO : get commit hash",
        });
    } catch (_error) {
        throw new ChatSDKError("bad_request:database", "Failed to save chat");
    }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
    try {
        return await db.insert(message).values(messages);
    } catch (_error) {
        throw new ChatSDKError("bad_request:database", "Failed to save messages");
    }
}
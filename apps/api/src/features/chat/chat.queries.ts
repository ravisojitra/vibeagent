import { asc, eq, gte, and, inArray } from "drizzle-orm";
import { db } from "@/core/db";
import { ChatSDKError } from "@/core/errors";
import { chat, message, projects, stream, type DBMessage, type Project } from "@/core/schema";

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

export async function createProject({
    id,
    userId,
}: {
    id: string;
    userId: string;
}): Promise<Project> {
    try {
        const [project] = await db.insert(projects).values({
            id,
            userId,
            name: "Untitled",
        }).returning();

        return project;
    } catch (_error) {
        throw new ChatSDKError("bad_request:database", "Failed to create project");
    }
}

export async function saveChat({
    id,
    userId,
    title,
    visibility,
    projectId,
}: {
    id: string;
    userId: string;
    title: string;
    visibility: "public" | "private";
    projectId: string;
}) {
    try {
        return await db.insert(chat).values({
            id,
            createdAt: new Date(),
            userId,
            title,
            visibility,
            projectId,
            commitHash: "TODO : get commit hash",
        });
    } catch (_error) {
        console.error(_error);
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

export async function updateChatVisibility({
    chatId,
    visibility,
}: {
    chatId: string;
    visibility: "public" | "private";
}) {
    try {
        return await db
            .update(chat)
            .set({ visibility })
            .where(eq(chat.id, chatId));
    } catch (_error) {
        throw new ChatSDKError(
            "bad_request:database",
            "Failed to update chat visibility"
        );
    }
}

export async function getMessageById({ id }: { id: string }) {
    try {
        const [msg] = await db.select().from(message).where(eq(message.id, id));
        return msg;
    } catch (_error) {
        throw new ChatSDKError(
            "bad_request:database",
            "Failed to get message by id"
        );
    }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
    try {
        const msg = await getMessageById({ id });

        if (!msg) {
            throw new ChatSDKError("bad_request:database", "Message not found");
        }

        const chatId = msg.chatId;
        const timestamp = msg.createdAt;

        const messagesToDelete = await db
            .select({ id: message.id })
            .from(message)
            .where(
                and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
            );

        const messageIds = messagesToDelete.map((currentMessage) => currentMessage.id);

        if (messageIds.length > 0) {
            return await db
                .delete(message)
                .where(
                    and(eq(message.chatId, chatId), inArray(message.id, messageIds))
                );
        }
    } catch (_error) {
        if (_error instanceof ChatSDKError) throw _error;
        throw new ChatSDKError(
            "bad_request:database",
            "Failed to delete trailing messages"
        );
    }
}


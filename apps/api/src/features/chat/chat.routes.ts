import type { Context } from "hono";
import { ChatSDKError } from "@/core/errors";
import type { ChatMessage } from "./chat.types";
import { createChatStream } from "./chat.service";
import {
    getChatById,
    getMessagesByChatId,
    updateChatVisibility,
    getMessageById,
    deleteTrailingMessages,
} from "./chat.queries";
import { auth } from "@/core/auth";

export const maxDuration = 60;

export async function POST(ctx: Context) {
    let requestBody: any;

    try {
        const json = await ctx.req.json();
        console.log(json);
        requestBody = json;
        // TODO : add zod validation
        // requestBody = postRequestBodySchema.parse(json);
    } catch (_) {
        return new ChatSDKError("bad_request:api").toResponse();
    }

    try {
        const {
            id,
            message,
            selectedChatModel,
            selectedVisibilityType,
        }: {
            id: string;
            message: ChatMessage;
            selectedChatModel: string;
            selectedVisibilityType: "public" | "private";
        } = requestBody;

        const session = await auth.api.getSession({
            headers: ctx.req.header(),
        });

        console.log(session);

        if (!session?.user) {
            return new ChatSDKError("unauthorized:chat").toResponse();
        }

        // const userType: UserType = session.user.type;

        // const messageCount = await getMessageCountByUserId({
        //     id: session.user.id,
        //     differenceInHours: 24,
        // });

        // TODO : rate limit goes here
        // if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
        //     return new ChatSDKError("rate_limit:chat").toResponse();
        // }

        const chat = await getChatById({ id });

        if (chat) {
            if (chat.userId !== session.user.id) {
                return new ChatSDKError("forbidden:chat").toResponse();
            }
        }

        return await createChatStream({
            id,
            message,
            selectedChatModel,
            selectedVisibilityType,
            userId: session.user.id,
        });
    } catch (error: any) {
        const vercelId = ctx.req.header("x-vercel-id");

        if (error instanceof ChatSDKError) {
            return error.toResponse();
        }

        // Check for Vercel AI Gateway credit card error
        if (
            error instanceof Error &&
            error.message?.includes(
                "AI Gateway requires a valid credit card on file to service requests"
            )
        ) {
            return new ChatSDKError("bad_request:activate_gateway").toResponse();
        }

        console.error("Unhandled error in chat API:", error, { vercelId });
        return new ChatSDKError("offline:chat").toResponse();
    }
}

export async function DELETE(ctx: Context) {
    // const { searchParams } = new URL(request.url);
    // const id = searchParams.get("id");

    // if (!id) {
    //     return new ChatSDKError("bad_request:api").toResponse();
    // }

    // const session = await auth();

    // if (!session?.user) {
    //     return new ChatSDKError("unauthorized:chat").toResponse();
    // }

    // const chat = await getChatById({ id });

    // if (chat?.userId !== session.user.id) {
    //     return new ChatSDKError("forbidden:chat").toResponse();
    // }

    // const deletedChat = await deleteChatById({ id });

    // return Response.json(deletedChat, { status: 200 });
}

export async function GET(ctx: Context) {
    const { id } = ctx.req.param();
    console.log(id);
    const chat = await getChatById({ id });
    console.log(chat);
    return Response.json(chat, { status: 200 });
}

export async function getMessages(ctx: Context) {
    const { id } = ctx.req.param();

    try {
        const messages = await getMessagesByChatId({ id });
        return Response.json(messages, { status: 200 });
    } catch (error) {
        if (error instanceof ChatSDKError) {
            return error.toResponse();
        }
        return new ChatSDKError("bad_request:database", "Failed to get messages").toResponse();
    }
}

export async function updateVisibility(ctx: Context) {
    const { id } = ctx.req.param();

    try {
        const { visibility } = await ctx.req.json();
        await updateChatVisibility({ chatId: id, visibility });
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        if (error instanceof ChatSDKError) {
            return error.toResponse();
        }
        return new ChatSDKError("bad_request:database", "Failed to update visibility").toResponse();
    }
}

export async function getMessage(ctx: Context) {
    const { id } = ctx.req.param();

    try {
        const message = await getMessageById({ id });
        return Response.json(message, { status: 200 });
    } catch (error) {
        if (error instanceof ChatSDKError) {
            return error.toResponse();
        }
        return new ChatSDKError("bad_request:database", "Failed to get message").toResponse();
    }
}

export async function deleteTrailing(ctx: Context) {
    const { id } = ctx.req.param();

    try {
        await deleteTrailingMessages({ id });
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        if (error instanceof ChatSDKError) {
            return error.toResponse();
        }
        return new ChatSDKError("bad_request:database", "Failed to delete messages").toResponse();
    }
}


import {
    convertToModelMessages,
    createUIMessageStream,
    JsonToSseTransformStream,
    smoothStream,
    stepCountIs,
    streamText,
} from "ai";
import {
    createResumableStreamContext,
    type ResumableStreamContext,
} from "resumable-stream";
import { auth } from "@/lib/auth";
// import type { VisibilityType } from "@/components/visibility-selector";
// import { entitlementsByUserType } from "@/lib/ai/entitlements";
// import type { ChatModel } from "@/lib/ai/models";
// import { myProvider } from "@/lib/ai/providers";
import {
    createStreamId,
    getChatById,
    getMessagesByChatId,
    saveChat,
    saveMessages,
} from "@/lib/queries";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
// import { generateTitleFromUserMessage } from "../../actions";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import { openai } from "@ai-sdk/openai";
import type { Context } from "hono";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
    if (!globalStreamContext) {
        try {
            globalStreamContext = createResumableStreamContext({
                waitUntil: null
            });
        } catch (error: any) {
            if (error.message.includes("REDIS_URL")) {
                console.log(
                    " > Resumable streams are disabled due to missing REDIS_URL"
                );
            } else {
                console.error(error);
            }
        }
    }

    return globalStreamContext;
}

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
        } else {
            // todo : generate title from user message
            // const title = await generateTitleFromUserMessage({
            //     message,
            // });
            const title = "Untitled";

            await saveChat({
                id,
                userId: session.user.id,
                title,
                visibility: selectedVisibilityType,
            });
        }

        const messagesFromDb = await getMessagesByChatId({ id });
        const uiMessages = [...convertToUIMessages(messagesFromDb), message];

        await saveMessages({
            messages: [
                {
                    chatId: id,
                    id: message.id,
                    role: "user",
                    parts: message.parts,
                    attachments: [],
                    createdAt: new Date(),
                },
            ],
        });

        const streamId = generateUUID();
        await createStreamId({ streamId, chatId: id });

        const stream = createUIMessageStream({
            execute: ({ writer: dataStream }) => {
                const result = streamText({
                    model: openai("gpt-4o"),
                    system: `this is system prompt`,
                    messages: convertToModelMessages(uiMessages),
                    stopWhen: stepCountIs(5),
                    experimental_activeTools:
                        selectedChatModel === "chat-model-reasoning"
                            ? []
                            : [],
                    experimental_transform: smoothStream({ chunking: "word" }),
                    tools: {
                    }
                });

                result.consumeStream();

                dataStream.merge(
                    result.toUIMessageStream({
                        sendReasoning: true,
                    })
                );
            },
            generateId: generateUUID,
            onFinish: async ({ messages }) => {
                await saveMessages({
                    messages: messages.map((currentMessage) => ({
                        id: currentMessage.id,
                        role: currentMessage.role,
                        parts: currentMessage.parts,
                        createdAt: new Date(),
                        attachments: [],
                        chatId: id,
                    })),
                });
            },
            onError: () => {
                return "Oops, an error occurred!";
            },
        });

        // const streamContext = getStreamContext();

        // if (streamContext) {
        //   return new Response(
        //     await streamContext.resumableStream(streamId, () =>
        //       stream.pipeThrough(new JsonToSseTransformStream())
        //     )
        //   );
        // }

        return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
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

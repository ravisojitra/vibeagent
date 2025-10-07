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
import { openai } from "@ai-sdk/openai";
import { generateUUID, convertToUIMessages } from "@/core/utils";
import {
    createProject,
    createStreamId,
    getChatById,
    getMessagesByChatId,
    saveChat,
    saveMessages,
} from "./chat.queries";
import type { ChatMessage } from "./chat.types";

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

export async function createChatStream({
    id,
    message,
    selectedChatModel,
    selectedVisibilityType,
    userId,
}: {
    id: string;
    message: ChatMessage;
    selectedChatModel: string;
    selectedVisibilityType: "public" | "private";
    userId: string;
}) {
    const chat = await getChatById({ id });

    if (!chat) {
        const title = "Untitled";

        const project = await createProject({
            id: generateUUID(),
            userId,
        });

        await saveChat({
            id,
            userId,
            title,
            visibility: selectedVisibilityType,
            projectId: project.id,
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
                model: openai("gpt-4.1-nano-2025-04-14"),
                system: `this is system prompt. You always write 10000 words rhyming poem for kids.`,
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

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
}


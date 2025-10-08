"use client";

import type { ChatMessage, AppUsage, Vote, Attachment, DBChat } from "@/types/chat";
import { MultimodalInput } from "../chat/multimodal-input";
import { Messages } from "../chat/messages";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import useSWR, { useSWRConfig } from "swr";
import { useDataStream } from "../chat/data-stream-provider";
import { generateUUID } from "@/lib/utils";
import { DefaultChatTransport } from "ai";
import { fetcher, fetchWithErrorHandlers } from "@/lib/callApi";
import { unstable_serialize } from "swr/infinite";
import { getChatHistoryPaginationKey } from "../sidebar/sidebar-history";
import { ChatSDKError } from "@/lib/errors";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useArtifactSelector } from "@/hooks/use-artifact";

interface ChatPanelProps {
    id: string;
    chat: DBChat;
    initialMessages: ChatMessage[];
    initialChatModel: string;
    isReadonly: boolean;
}

export function ChatPanel({
    id,
    chat,
    initialMessages,
    initialChatModel,
    isReadonly,
}: ChatPanelProps) {
    const { visibilityType } = useChatVisibility({
        chatId: id,
        initialVisibilityType: chat.visibility,
    });

    const { mutate } = useSWRConfig();
    const { setDataStream } = useDataStream();

    const [input, setInput] = useState<string>("");
    const [usage, setUsage] = useState<AppUsage | undefined>(chat.lastContext ?? undefined);
    const [currentModelId, setCurrentModelId] = useState(initialChatModel);
    const currentModelIdRef = useRef(currentModelId);

    useEffect(() => {
        currentModelIdRef.current = currentModelId;
    }, [currentModelId]);

    const {
        messages,
        setMessages,
        sendMessage,
        status,
        stop,
        regenerate,
        resumeStream,
    } = useChat<ChatMessage>({
        id,
        messages: initialMessages,
        experimental_throttle: 100,
        generateId: generateUUID,
        transport: new DefaultChatTransport({
            api: "http://localhost:3001/api/chat",
            fetch: fetchWithErrorHandlers,
            prepareSendMessagesRequest(request) {
                return {
                    body: {
                        id: request.id,
                        message: request.messages.at(-1),
                        selectedChatModel: currentModelIdRef.current,
                        selectedVisibilityType: visibilityType,
                        ...request.body,
                    },
                };
            },
        }),
        onData: (dataPart) => {
            setDataStream((ds) => (ds ? [...ds, dataPart] : []));
            if (dataPart.type === "data-usage") {
                setUsage(dataPart.data);
            }
        },
        onFinish: () => {
            mutate(unstable_serialize(getChatHistoryPaginationKey));
        },
        onError: (error) => {
            if (error instanceof ChatSDKError) {
                // Check if it's a credit card error
                if (
                    error.message?.includes("AI Gateway requires a valid credit card")
                ) {
                    // setShowCreditCardAlert(true);
                } else {
                    toast.error(error.message);
                }
            }
        },
    });

    const searchParams = useSearchParams();
    const query = searchParams.get("query");

    const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

    useEffect(() => {
        if (query && !hasAppendedQuery) {
            sendMessage({
                role: "user" as const,
                parts: [{ type: "text", text: query }],
            });

            setHasAppendedQuery(true);
            window.history.replaceState({}, "", `/chat/${id}`);
        }
    }, [query, sendMessage, hasAppendedQuery, id]);

    const { data: votes } = useSWR<Vote[]>(
        messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
        fetcher
    );

    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

    useAutoResume({
        autoResume: true,
        initialMessages,
        resumeStream,
        setMessages,
    });

    return (
        <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
            <Messages
                chatId={id}
                isArtifactVisible={isArtifactVisible}
                isReadonly={isReadonly}
                messages={messages}
                regenerate={regenerate}
                selectedModelId={initialChatModel}
                setMessages={setMessages}
                status={status}
                votes={votes}
            />

            <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:pl-4 md:pr-0 md:pb-4">
                {!isReadonly && (
                    <MultimodalInput
                        attachments={attachments}
                        chatId={id}
                        input={input}
                        messages={messages}
                        onModelChange={setCurrentModelId}
                        selectedModelId={currentModelId}
                        selectedVisibilityType={visibilityType}
                        sendMessage={sendMessage}
                        setAttachments={setAttachments}
                        setInput={setInput}
                        setMessages={setMessages}
                        status={status}
                        stop={stop}
                        usage={usage}
                    />
                )}
            </div>
        </div>
    );
}


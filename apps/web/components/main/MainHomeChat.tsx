"use client";
import { useRef, useState } from "react";
import { MultimodalInput } from "../chat/multimodal-input";
import { AppUsage, Attachment, ChatMessage } from "@/types/chat";
import { generateUUID } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetchWithErrorHandlers } from "@/lib/callApi";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useDataStream } from "../chat/data-stream-provider";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { getChatHistoryPaginationKey } from "../sidebar/sidebar-history";
import { ChatSDKError } from "@/lib/errors";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAutoResume } from "@/hooks/use-auto-resume";

export function MainHomeChat({ initialChatModel }: { initialChatModel: string }) {
    const id = generateUUID();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [input, setInput] = useState<string>("");
    const [currentModelId, setCurrentModelId] = useState(initialChatModel);
    const [usage, setUsage] = useState<AppUsage | undefined>();
    const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
    const currentModelIdRef = useRef(currentModelId);

    const { visibilityType } = useChatVisibility({
        chatId: id,
        initialVisibilityType: "private",
    });
    const { mutate } = useSWRConfig();
    const { setDataStream } = useDataStream();

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
        messages: [],
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
                    setShowCreditCardAlert(true);
                } else {
                    toast.error(error.message);
                }
            }
        },
    });

    useAutoResume({
        autoResume: false,
        initialMessages: [],
        resumeStream,
        setMessages,
    });

    return (
        <>
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
            <AlertDialog
                onOpenChange={setShowCreditCardAlert}
                open={showCreditCardAlert}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
                        <AlertDialogDescription>
                            This application requires{" "}
                            {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
                            activate Vercel AI Gateway.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                window.open(
                                    "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                                    "_blank"
                                );
                                window.location.href = "/";
                            }}
                        >
                            Activate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { LanguageModelUsage } from "ai";
import type { UsageData } from "tokenlens/helpers";
import { ReactNode } from "react";
import { UseChatHelpers } from "@ai-sdk/react";

// Server-merged usage: base usage + TokenLens summary + optional modelId
export type AppUsage = LanguageModelUsage & UsageData & { modelId?: string };


export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
    createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = any//InferUITool<typeof any>;

export type ChatTools = {
    getWeather: weatherTool;
};

export type CustomUIDataTypes = {
    textDelta: string;
    imageDelta: string;
    sheetDelta: string;
    codeDelta: string;
    appendMessage: string;
    id: string;
    title: string;
    clear: null;
    finish: null;
    usage: AppUsage;
};

export type ChatMessage = UIMessage<
    MessageMetadata,
    CustomUIDataTypes
>;

export type Attachment = {
    name: string;
    url: string;
    contentType: string;
};

export type DBMessage = {
    id: string,
    chatId: string,
    role: string,
    parts: any,
    attachments: any,
    createdAt: Date,
};

export type VisibilityType = "private" | "public";

export type ArtifactKind = any
export type UIArtifact = {
    title: string;
    documentId: string;
    kind: ArtifactKind;
    content: string;
    isVisible: boolean;
    status: "streaming" | "idle";
    boundingBox: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
};

export type Vote = {
    chatId: string;
    messageId: string;
    isUpvoted: boolean;
};

export type ArtifactToolbarContext = {
    sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
};

export type ArtifactToolbarItem = {
    description: string;
    icon: ReactNode;
    onClick: (context: ArtifactToolbarContext) => void;
};

export type DBChat = {
    id: string;
    title: string;
    userId: string;
    visibility: VisibilityType;
    lastContext: AppUsage | null;
    createdAt: Date;
};
import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
    createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;



export type ChatTools = {
    // getWeather: weatherTool;
    // createDocument: createDocumentTool;
    // updateDocument: updateDocumentTool;
    // requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
    textDelta: string;
    imageDelta: string;
    sheetDelta: string;
    codeDelta: string;
    // suggestion: Suggestion;
    appendMessage: string;
    id: string;
    title: string;
    // kind: ArtifactKind;
    clear: null;
    finish: null;
    // usage: AppUsage;
};

export type ChatMessage = UIMessage<
    MessageMetadata,
    // CustomUIDataTypes,
    ChatTools
>;

export type Attachment = {
    name: string;
    url: string;
    contentType: string;
};


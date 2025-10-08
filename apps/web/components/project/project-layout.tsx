"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatPanel } from "./chat-panel";
import { PreviewSection } from "./preview-section";
import type { ChatMessage, VisibilityType, AppUsage, DBChat } from "@/types/chat";
import { useResizablePanel } from "@/hooks/use-resizable-panel";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectLayoutProps {
    id: string;
    chat: DBChat;
    initialMessages: ChatMessage[];
    isReadonly: boolean;
    initialChatModel: string;
}

export function ProjectLayout({
    id,
    chat,
    initialMessages,
    isReadonly,
    initialChatModel
}: ProjectLayoutProps) {
    const [showChat, setShowChat] = useState(true);
    const [showPreview, setShowPreview] = useState(true);
    const { isDesktop, isMobile } = useIsMobile();
    const containerRef = useRef<HTMLDivElement>(null);

    const {
        panelWidth: chatWidth,
        isResizing,
        startResizing,
    } = useResizablePanel({
        containerRef,
        initialWidth: 25,
        minWidth: 25,
        maxWidth: 75,
    });

    useEffect(() => {
        if (isMobile) { setShowPreview(false) }
    }, [isMobile]);

    return (
        <div
            ref={containerRef}
            className="flex h-full w-full flex-col lg:flex-row overflow-hidden p-1 md:p-0"
        >
            {/* Chat Panel - Mobile: Full screen when visible, Desktop: Left side with resize */}
            <div
                className={cn(
                    "relative",
                    // Mobile: Full width when shown, hidden when not
                    showChat ? "flex md:w-[25%] w-full" : "hidden",
                    // Desktop: Resizable width with smooth transition when not resizing
                    "lg:flex h-full",
                    !isResizing && "transition-all duration-200",
                    !showPreview && "lg:!w-[25%]"
                )}
                style={{
                    width: isDesktop && showPreview ? `${chatWidth}%` : undefined,
                }}
            >
                <div className="flex-1 overflow-hidden">
                    <ChatPanel
                        id={id}
                        chat={chat}
                        initialChatModel={initialChatModel}
                        initialMessages={initialMessages}
                        isReadonly={isReadonly}
                    />
                </div>

                {/* Toggle button for mobile - Hide chat / Show preview */}
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                        setShowChat(false);
                        setShowPreview(true);
                    }}
                    className="h-5 w-5 absolute right-2 top-2 z-10 lg:hidden"
                    title="Toggle chat"
                >
                    <ChevronRight className="h-[14px] w-[14px]" />
                </Button>
            </div>

            {/* Resizable Divider - Desktop only */}
            {showChat && showPreview && (
                <div
                    className={cn(
                        "hidden lg:flex relative w-4 cursor-col-resize group items-center justify-center transition-colors duration-300",
                    )}
                    onMouseDown={startResizing}
                    role="separator"
                    aria-orientation="vertical"
                    tabIndex={0}
                >
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2" />
                    <div className={cn(
                        "absolute inset-y-0 left-1/2 w-1 transition-opacity duration-300 -translate-x-1/2 rounded-full",
                    )} />
                </div>
            )}

            {/* Preview Panel - Mobile: Full screen when visible, Desktop: Right side */}
            <div
                className={cn(
                    "relative border border-border mb-4 rounded-lg",
                    // Mobile: Full width when shown, hidden when not
                    showPreview ? "flex md:w-[75%] w-full" : "hidden",
                    // Desktop: Takes remaining width with smooth transition when not resizing
                    "lg:flex h-full md:h-auto",
                    !isResizing && "transition-all duration-200",
                    !showChat && "lg:!w-full"
                )}
                style={{
                    width: isDesktop && showChat ? `${100 - chatWidth}%` : undefined,
                }}
            >
                <div className="flex-1 overflow-hidden">
                    <PreviewSection setShowPreview={setShowPreview} setShowChat={setShowChat} />
                </div>
            </div>
        </div>
    );
}


"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { FeatureTabs } from "./feature-tabs";
import { PreviewContent } from "./preview-content";
import { Button } from "../ui/button";
import { ChevronLeft, Maximize2 } from "lucide-react";
import { ControlsRow, DeviceSize } from "./controls-row";

export function PreviewSection({ setShowPreview, setShowChat }: { setShowPreview: (show: boolean) => void, setShowChat: (show: boolean) => void }) {
    const [url, setUrl] = useState("/");
    const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleRefresh = () => {
        // Refresh logic
        window.location.reload();
    };

    const handleOpenInNewTab = () => {
        window.open(url, "_blank");
    };

    const handleGoBack = () => {
        window.history.back();
    };

    const handleGoForward = () => {
        window.history.forward();
    };

    const handleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className="flex h-full w-full flex-col bg-card rounded-lg">
            <Tabs defaultValue="standard" className="flex h-full w-full flex-col gap-0">
                {/* Header with all controls */}
                <div className="flex flex-col gap-2 border-b border-border bg-card px-2 py-1 rounded-t-lg">

                    {/* Desktop Layout */}
                    <div className="hidden items-center justify-between gap-2 lg:flex">

                        <div className="flex items-center gap-2 h-full">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleFullscreen}
                                className="h-5 w-5"
                                title="Toggle fullscreen"
                            >
                                <Maximize2 className="h-[14px] w-[14px]" />
                            </Button>
                            <ControlsRow
                                url={url}
                                onUrlChange={setUrl}
                                deviceSize={deviceSize}
                                onDeviceSizeChange={setDeviceSize}
                                onGoBack={handleGoBack}
                                onGoForward={handleGoForward}
                                onRefresh={handleRefresh}
                                onOpenInNewTab={handleOpenInNewTab}
                            />
                        </div>
                        <FeatureTabs />
                    </div>

                    {/* Mobile Layout */}
                    <div className="flex flex-col gap-2 lg:hidden">

                        <div className="flex items-center gap-2">
                            <Button
                                className="lg:hidden h-5 w-5"
                                onClick={() => {
                                    setShowPreview(false);
                                    setShowChat(true);
                                }}
                                size="icon"
                                variant="ghost"
                            >
                                <ChevronLeft className="h-[14px] w-[14px]" />
                            </Button>
                            <FeatureTabs />
                        </div>

                        <ControlsRow
                            url={url}
                            onUrlChange={setUrl}
                            deviceSize={deviceSize}
                            onDeviceSizeChange={setDeviceSize}
                            onGoBack={handleGoBack}
                            onGoForward={handleGoForward}
                            onRefresh={handleRefresh}
                            onOpenInNewTab={handleOpenInNewTab}
                        />
                    </div>
                </div>

                {/* Content Area */}
                <PreviewContent />
            </Tabs>
        </div>
    );
}


"use client";

import { ActionButtons } from "./action-buttons";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type DeviceSize = "desktop" | "tablet" | "mobile";

interface ControlsRowProps {
    url: string;
    onUrlChange: (url: string) => void;
    deviceSize: DeviceSize;
    onDeviceSizeChange: (size: DeviceSize) => void;
    onGoBack: () => void;
    onGoForward: () => void;
    onRefresh: () => void;
    onOpenInNewTab: () => void;
}

export function ControlsRow({
    url,
    onUrlChange,
    deviceSize,
    onDeviceSizeChange,
    onGoBack,
    onGoForward,
    onRefresh,
    onOpenInNewTab,
}: ControlsRowProps) {
    return (
        <div className="flex items-center gap-1 h-full">
            <div className="flex items-center border border-border rounded-md gap-1 px-1 w-full h-full md:w-auto">
                <div className="flex items-center gap-1 border-r border-border pr-1">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onGoBack}
                        className="h-5 w-5"
                        title="Go back"
                    >
                        <ChevronLeft className="h-[14px] w-[14px]" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onGoForward}
                        className="h-5 w-5"
                        title="Go forward"
                    >
                        <ChevronRight className="h-[14px] w-[14px]" />
                    </Button>
                </div>
                <div className="px-2 py-1.5 max-w-[300px] w-full h-[25px] flex items-center gap-1 text-[12px] border-r border-border">
                    <input
                        value={url}
                        onChange={(e) => onUrlChange(e.target.value)}
                        className="w-full outline-none ring-0"
                        placeholder="Enter URL..."
                    />
                </div>
                <ActionButtons
                    onRefresh={onRefresh}
                    onOpenInNewTab={onOpenInNewTab}
                    deviceSize={deviceSize}
                    onDeviceSizeChange={onDeviceSizeChange}
                />
            </div>
        </div>
    );
}

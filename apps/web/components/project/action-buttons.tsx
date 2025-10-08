"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import React from "react";

interface ActionButtonsProps {
    onRefresh: () => void;
    onOpenInNewTab: () => void;
    deviceSize: "desktop" | "tablet" | "mobile";
    onDeviceSizeChange: (size: "desktop" | "tablet" | "mobile") => void;
}

export function ActionButtons({ onRefresh, onOpenInNewTab, deviceSize, onDeviceSizeChange }: ActionButtonsProps) {
    const deviceIcons: Record<"desktop" | "tablet" | "mobile", React.ReactNode> = {
        desktop: <Monitor className="h-[14px] w-[14px]" />,
        tablet: <Tablet className="h-[14px] w-[14px]" />,
        mobile: <Smartphone className="h-[14px] w-[14px]" />,
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                size="icon"
                variant="ghost"
                onClick={onRefresh}
                className="h-5 w-5"
                title="Refresh"
            >
                <RefreshCw className="h-[14px] w-[14px]" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={onOpenInNewTab}
                className="h-5 w-5"
                title="Open in new tab"
            >
                <ExternalLink className="h-[14px] w-[14px]" />
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-5 w-5 focus-visible:ring-0" title="Change device size">
                        {deviceIcons[deviceSize]}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onDeviceSizeChange("desktop")}>
                        <Monitor className="mr-2 h-4 w-4" />
                        <span>Desktop</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeviceSizeChange("tablet")}>
                        <Tablet className="mr-2 h-4 w-4" />
                        <span>Tablet</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeviceSizeChange("mobile")}>
                        <Smartphone className="mr-2 h-4 w-4" />
                        <span>Mobile</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

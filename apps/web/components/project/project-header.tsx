"use client";

import { Button } from "@/components/ui/button";
import {
    Share2,
    Zap,
    Globe,
    ChevronRight
} from "lucide-react";
import { GitIcon } from "@/constants/icons";

interface ProjectHeaderProps {
    projectName?: string;
}

export function ProjectHeader({
    projectName = "Space Agency Calculator",
}: ProjectHeaderProps) {
    return (
        <div className="flex py-3 w-full items-center justify-between px-3">
            {/* Left section - Project Logo & Name */}
            <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 cursor-pointer">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-pink-500">
                        <span className="text-xs font-bold text-white">🌸</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </div>
                <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                    {projectName}
                </p>
            </div>

            {/* Right section - Action buttons */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-7 w-7 bg-background">
                    <GitIcon size={16} />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 hidden sm:flex bg-background"
                >
                    <Share2 className="h-3 w-3" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs hidden md:flex bg-background"
                >
                    <Zap className="h-2 w-2" />
                    Upgrade
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs bg-background"
                >
                    <Globe className="h-2 w-2" />
                    <span className="hidden sm:inline">Publish</span>
                </Button>
            </div>
        </div>
    );
}


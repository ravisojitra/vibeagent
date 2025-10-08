"use client";

import { Card } from "@/components/ui/card";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewFrameProps {
    type: "standard" | "scientific" | "graphing" | "converter";
}

export function PreviewFrame({ type }: PreviewFrameProps) {
    return (
        <div className="flex h-full w-full items-center justify-center p-4 md:p-6 lg:p-8">
            <Card className="flex h-full w-full max-w-4xl flex-col overflow-hidden shadow-lg">
                {/* Frame Header */}
                <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2 md:px-4 md:py-2.5">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500 md:h-3 md:w-3" />
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 md:h-3 md:w-3" />
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 md:h-3 md:w-3" />
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground md:text-sm">
                            Preview - {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                            <Minimize2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                            <Maximize2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                    </div>
                </div>

                {/* Preview Content Area */}
                <div className="flex flex-1 items-center justify-center bg-muted/20 p-4 md:p-8">
                    <div className="text-center text-muted-foreground">
                        <div className="mb-2 text-4xl md:text-6xl">🖼️</div>
                        <p className="text-sm md:text-base">
                            Preview content will render here
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            Type: {type}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}


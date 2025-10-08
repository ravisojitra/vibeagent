"use client";

import { TabsContent } from "@/components/ui/tabs";
import { PreviewFrame } from "./preview-frame";

interface PreviewContentProps {
    className?: string;
}

export function PreviewContent({ className }: PreviewContentProps) {
    return (
        <div className={`flex-1 overflow-auto ${className || ""}`}>
            <TabsContent value="standard" className="m-0 h-full">
                <PreviewFrame type="standard" />
            </TabsContent>
            <TabsContent value="scientific" className="m-0 h-full">
                <PreviewFrame type="scientific" />
            </TabsContent>
            <TabsContent value="graphing" className="m-0 h-full">
                <PreviewFrame type="graphing" />
            </TabsContent>
            <TabsContent value="converter" className="m-0 h-full">
                <PreviewFrame type="converter" />
            </TabsContent>
        </div>
    );
}

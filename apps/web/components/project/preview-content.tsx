"use client";

import { TabsContent } from "@/components/ui/tabs";
import { PreviewFrame } from "./preview-frame";
import { CodeEditorPanel } from "./codeEditor";
import { GeneratedFiles } from "./codeEditor/generated-files";

interface PreviewContentProps {
    className?: string;
}

export function PreviewContent({ className }: PreviewContentProps) {
    return (
        <div className={`flex-1 overflow-auto ${className || ""}`}>
            <TabsContent value="standard" className="m-0 h-full">
                <PreviewFrame type="standard" />
            </TabsContent>
            <TabsContent value="code" className="m-0 h-full">
                <CodeEditorPanel generatedFiles={GeneratedFiles} />
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

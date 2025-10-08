'use client';
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function FileHeader({
    file,
}: {
    file: { path: string; content?: string };
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (file?.content) {
            navigator.clipboard.writeText(file.content);
            setCopied(true);
            toast.success("File content copied");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex items-center justify-between px-3 py-1.5 border-b">
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-muted-foreground truncate">
                    {file.path}
                </span>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="cursor-pointer h-5 w-5 p-0"
                    title="Copy file content"
                >
                    {copied ? (
                        <Check className="h-3 w-3" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-5 w-5 p-0"
                    title="View on GitHub"
                >
                    <a
                        href="https://21st.dev/bankkroll/file-viewer/default"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </Button>
            </div>
        </div>
    );
}

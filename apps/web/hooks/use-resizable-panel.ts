"use client";

import { useState, useCallback, useEffect } from "react";

interface UseResizablePanelOptions {
    containerRef: React.RefObject<HTMLDivElement | null>;
    minWidth?: number; // percentage
    maxWidth?: number; // percentage
    initialWidth?: number; // percentage
}

export function useResizablePanel({
    containerRef,
    minWidth = 25,
    maxWidth = 75,
    initialWidth = 25,
}: UseResizablePanelOptions) {
    const [panelWidth, setPanelWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            const newWidth =
                ((e.clientX - containerRect.left) / containerRect.width) * 100;

            const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
            setPanelWidth(clampedWidth);
        },
        [isResizing, containerRef, minWidth, maxWidth],
    );

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", stopResizing);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
        } else {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", stopResizing);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", stopResizing);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing, handleMouseMove, stopResizing]);

    return { panelWidth, isResizing, startResizing };
}

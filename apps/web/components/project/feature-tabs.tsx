"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code } from "lucide-react";

export function FeatureTabs() {
    return (
        <TabsList className="bg-transparent p-0">
            <TabsTrigger value="standard" className="text-xs md:text-sm gap-1">
                <Code className="h-[14px] w-[14px]" />
                Standard
            </TabsTrigger>
            <TabsTrigger value="scientific" className="text-xs md:text-sm gap-1">
                <Code className="h-[14px] w-[14px]" />
                Code
            </TabsTrigger>
            <TabsTrigger value="graphing" className="text-xs md:text-sm gap-1">
                <Code className="h-[14px] w-[14px]" />
                Graphing
            </TabsTrigger>
            <TabsTrigger value="converter" className="text-xs md:text-sm gap-1">
                <Code className="h-[14px] w-[14px]" />
                Converter
            </TabsTrigger>
        </TabsList>
    );
}

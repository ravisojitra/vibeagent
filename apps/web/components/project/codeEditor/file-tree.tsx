'use client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    useCallback, useEffect, useMemo, useState, createContext,
    useContext,
} from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";
import { getFileIcon } from "./file-icons";

interface TreeViewElement {
    id: string;
    name: string;
    isSelectable?: boolean;
    children?: TreeViewElement[];
}


interface TreeContextProps {
    selectedId: string | undefined;
    expandedItems: string[] | undefined;
    handleExpand: (id: string) => void;
    selectItem: (id: string) => void;
    setExpandedItems?: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    indicator: boolean;
    openIcon?: React.ReactNode;
    closeIcon?: React.ReactNode;
    direction: "rtl" | "ltr";
}

const TreeContext = createContext<TreeContextProps | null>(null);
const useTree = () => {
    const context = useContext(TreeContext);
    if (!context) throw new Error("useTree must be used within a TreeProvider");
    return context;
};

// --- File Tree ---
function TreeIndicator({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "absolute left-1.5 h-full w-px rounded-md bg-accent py-3 transition-colors hover:bg-slate-300 rtl:right-1.5",
                className
            )}
            {...props}
        />
    );
}

function Folder({
    element,
    value,
    isSelectable = true,
    isSelect,
    children,
    className,
}: {
    element: string;
    value: string;
    isSelectable?: boolean;
    isSelect?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    const {
        direction,
        handleExpand,
        expandedItems,
        indicator,
        openIcon,
        closeIcon,
    } = useTree();
    return (
        <AccordionPrimitive.Item
            value={value}
            className="relative h-full overflow-hidden"
        >
            <AccordionPrimitive.Trigger
                className={cn(
                    "flex items-center gap-1 rounded-md text-sm px-2 py-1 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    isSelect && isSelectable && "bg-accent",
                    !isSelectable && "opacity-50 cursor-not-allowed",
                    className
                )}
                disabled={!isSelectable}
                onClick={() => handleExpand(value)}
            >
                {expandedItems?.includes(value)
                    ? openIcon ?? <FolderOpenIcon className="h-4 w-4" />
                    : closeIcon ?? <FolderIcon className="h-4 w-4" />}
                <span className="truncate">{element}</span>
            </AccordionPrimitive.Trigger>
            <AccordionPrimitive.Content className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="pb-1 pt-0">
                    {indicator && <TreeIndicator />}
                    <AccordionPrimitive.Root
                        type="multiple"
                        className={cn(
                            "ml-5 flex flex-col gap-1 py-1",
                            direction === "rtl" && "mr-5"
                        )}
                        value={expandedItems}
                    >
                        {children}
                    </AccordionPrimitive.Root>
                </div>
            </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
    );
}

function File({
    value,
    isSelectable = true,
    isSelect,
    fileIcon,
    children,
    className,
    onClick,
}: {
    value: string;
    isSelectable?: boolean;
    isSelect?: boolean;
    fileIcon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) {
    const { selectedId, selectItem } = useTree();
    const isSelected = isSelect ?? selectedId === value;
    return (
        <button
            disabled={!isSelectable}
            className={cn(
                "flex w-fit items-center gap-1 rounded-md px-1 py-[2px] text-sm transition-colors cursor-pointer",
                isSelected && isSelectable && "dark:bg-input/30 bg-background dark:border border-input",
                !isSelectable
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-accent hover:text-accent-foreground",
                className
            )}
            onClick={() => {
                selectItem(value);
                onClick?.();
            }}
        >
            {fileIcon ?? <FileIcon className="h-4 w-4" />}
            <span className="truncate">{children}</span>
        </button>
    );
}

function Tree({
    elements,
    initialSelectedId,
    initialExpandedItems,
    children,
    className,
    indicator = true,
    openIcon,
    closeIcon,
    dir = "ltr",
}: {
    elements?: TreeViewElement[];
    initialSelectedId?: string;
    initialExpandedItems?: string[];
    children: React.ReactNode;
    className?: string;
    indicator?: boolean;
    openIcon?: React.ReactNode;
    closeIcon?: React.ReactNode;
    dir?: "rtl" | "ltr";
}) {
    const [selectedId, setSelectedId] = useState<string | undefined>(
        initialSelectedId
    );
    const [expandedItems, setExpandedItems] = useState<string[] | undefined>(
        initialExpandedItems
    );
    const getAllExpandableItems = useCallback(
        (elements?: TreeViewElement[]): string[] => {
            const expandableItems: string[] = [];
            const traverse = (items: TreeViewElement[]) => {
                items.forEach((item) => {
                    if (item.children?.length) {
                        expandableItems.push(item.id);
                        traverse(item.children);
                    }
                });
            };
            if (elements) traverse(elements);
            return expandableItems;
        },
        []
    );
    const selectItem = useCallback((id: string) => setSelectedId(id), []);
    const handleExpand = useCallback((id: string) => {
        setExpandedItems((prev) => {
            if (prev?.includes(id)) return prev.filter((item) => item !== id);
            return [...(prev ?? []), id];
        });
    }, []);
    useEffect(() => {
        if (elements) setExpandedItems(getAllExpandableItems(elements));
    }, [elements, getAllExpandableItems]);
    return (
        <TreeContext.Provider
            value={{
                selectedId,
                expandedItems,
                handleExpand,
                selectItem,
                setExpandedItems,
                indicator,
                openIcon,
                closeIcon,
                direction: dir,
            }}
        >
            <div className={cn("size-full", className)}>
                <div className="relative h-full px-2">
                    <AccordionPrimitive.Root
                        type="multiple"
                        value={expandedItems}
                        className="flex flex-col gap-1"
                    >
                        {children}
                    </AccordionPrimitive.Root>
                </div>
            </div>
        </TreeContext.Provider>
    );
}
function TreeItem({
    item,
    selectedFile,
    onFileSelect,
}: {
    item: TreeViewElement;
    selectedFile?: string;
    onFileSelect: (file: string) => void;
}) {
    if (item.children?.length) {
        return (
            <Folder
                key={item.id}
                element={item.name}
                value={item.id}
                className="truncate"
            >
                {item.children.map((child) => (
                    <TreeItem
                        key={child.id}
                        item={child}
                        selectedFile={selectedFile}
                        onFileSelect={onFileSelect}
                    />
                ))}
            </Folder>
        );
    }
    return (
        <File
            key={item.id}
            value={item.id}
            onClick={() => onFileSelect(item.id)}
            isSelectable={true}
            isSelect={selectedFile === item.id}
            className="truncate whitespace-nowrap"
            fileIcon={getFileIcon(item.name)}
        >
            {item.name}
        </File>
    );
}



export function FileTree({
    selectedFile,
    onFileSelect,
    generatedFiles,
}: {
    selectedFile?: string;
    onFileSelect: (file: string) => void;
    generatedFiles: { path: string, content: string }[];
}) {

    const tree = useMemo(() => {
        const root: Record<string, any> = {};
        for (const file of generatedFiles) {
            const parts = file.path.split("/");
            let current = root;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (!current[part]) {
                    current[part] =
                        i === parts.length - 1
                            ? { ...file, id: file.path, name: part, isSelectable: true }
                            : {
                                id: parts.slice(0, i + 1).join("/"),
                                name: part,
                                children: {},
                                isSelectable: false,
                            };
                }
                current = current[part].children || current[part];
            }
        }
        const toArray = (obj: Record<string, any>): TreeViewElement[] =>
            Object.values(obj).map((item: any) =>
                item.children ? { ...item, children: toArray(item.children) } : item
            );
        return toArray(root);
    }, [generatedFiles]);

    const allExpandableItems = useMemo(() => {
        const expandableItems: string[] = [];
        const traverse = (elements: TreeViewElement[]) => {
            elements.forEach((element) => {
                if (element.children?.length) {
                    expandableItems.push(element.id);
                    traverse(element.children);
                }
            });
        };
        traverse(tree);
        return expandableItems;
    }, [tree]);

    return (
        <div className="w-full h-full border-r">
            <ScrollArea className="h-full">
                <div className="p-2">
                    <Tree
                        elements={tree}
                        initialExpandedItems={allExpandableItems}
                        initialSelectedId={selectedFile}
                        indicator
                    >
                        {tree.map((item) => (
                            <TreeItem
                                key={item.id}
                                item={item}
                                selectedFile={selectedFile}
                                onFileSelect={onFileSelect}
                            />
                        ))}
                    </Tree>
                </div>
            </ScrollArea>
        </div>
    );
}
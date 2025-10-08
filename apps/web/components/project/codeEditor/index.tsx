'use client';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileTree } from "./file-tree";
import { useEffect, useState } from "react";
import { FileHeader } from "./file-header";
import { MonacoCodeEditor } from "./MonacoCodeEditor";

interface Props {
  generatedFiles: { path: string, content: string }[];
}

export function CodeEditorPanel({ generatedFiles }: Props) {
  const [selectedFile, setSelectedFile] = useState<string | undefined>(undefined);
  const selected = generatedFiles.find((f) => f.path === selectedFile) || generatedFiles[0];

  useEffect(() => {
    if (!selectedFile && generatedFiles.length > 0) {
      setSelectedFile(generatedFiles[0].path);
    }
  }, [selectedFile, generatedFiles]);

  return (
    <div className="w-full h-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[600px] overflow-hidden"
      >

        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
          <FileTree
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            generatedFiles={generatedFiles}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={75} minSize={40}>
          {selected && (
            <div className="h-full flex flex-col">
              <FileHeader
                file={selected}
              />
              <div className="flex-1 overflow-hidden flex h-full">
                <MonacoCodeEditor
                  hasAccess={true}
                  editorContent={selected.content}
                  showDiff={false}
                  previousContent={undefined}
                  handleEditorChange={() => { }}
                  selectedFile={selected}
                />
              </div>
            </div>
          )}
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
};
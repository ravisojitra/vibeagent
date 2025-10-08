'use client'

import Editor, { OnMount, DiffEditor } from '@monaco-editor/react'
import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import type { editor } from 'monaco-editor/esm/vs/editor/editor.api';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from "next-themes";
import { useIsMobile } from '@/hooks/use-mobile';

// Common editor options
const commonEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    lineHeight: 18,
    minimap: { enabled: false },
    scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        verticalScrollbarSize: 12,
        horizontalScrollbarSize: 12,
    },
    padding: { top: 16, bottom: 16 },
    lineNumbers: 'on',
    glyphMargin: false,
    folding: true,
    lineDecorationsWidth: 8,
    renderLineHighlight: 'line',
    wordWrap: 'on',
    suggest: {
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showConstants: true,
        showProperties: true,
        showWords: true,
    },
    quickSuggestions: {
        other: true,
        comments: true,
        strings: true
    },
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    inlayHints: {
        enabled: 'on'
    },
    formatOnType: true,
    formatOnPaste: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    autoSurround: 'languageDefined',
    bracketPairColorization: {
        enabled: true,
    },
    guides: {
        bracketPairs: true,
        indentation: true,
    },
    renderWhitespace: 'selection',
    renderControlCharacters: false,
    automaticLayout: true,
    largeFileOptimizations: true,
    linkedEditing: true,
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: "on",
};

export function MonacoCodeEditor({
    hasAccess,
    editorContent,
    showDiff = false,
    previousContent,
    handleEditorChange,
    selectedFile
}: {
    hasAccess: boolean,
    editorContent: string,
    showDiff: boolean,
    previousContent?: string,
    handleEditorChange: (value: string | undefined) => void,
    selectedFile: { path: string, content: string }
}) {
    const { theme } = useTheme();
    const isMobile = useIsMobile();
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const diffEditorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const previousModelRef = useRef<editor.ITextModel | null>(null);
    const modelPathRef = useRef<string | null>(null);
    const initialContentRef = useRef<string>('');
    const isInitialLoadRef = useRef(true);
    const lastFilePathRef = useRef<string | null>(null);

    useEffect(() => {
        if (monacoRef.current) {
            monacoRef.current.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
        }
    }, [theme]);

    // Handle model creation and cleanup to prevent memory leaks
    useEffect(() => {
        if (!monacoRef.current || !selectedFile?.path) return;

        const monaco = monacoRef.current;
        const currentPath = selectedFile.path;

        // Reset scroll position when switching files
        if (lastFilePathRef.current !== currentPath) {
            isInitialLoadRef.current = true;
            lastFilePathRef.current = currentPath;
        }

        // Only create a new model if the path has changed
        if (modelPathRef.current !== currentPath) {
            // Dispose previous model to prevent memory leaks
            if (previousModelRef.current) {
                previousModelRef.current.dispose();
            }

            // Create a new model with the current file path as URI
            const uri = monaco.Uri.parse(`file:///${currentPath}`);
            const language = getLanguage(getFileName(currentPath));

            if (showDiff && previousContent !== undefined) {
                // Create models for original and modified content
                const originalModel = monaco.editor.createModel(previousContent, language, monaco.Uri.parse(`file:///original/${currentPath}`));
                const modifiedModel = monaco.editor.createModel(editorContent, language, uri);

                // Set the models to the diff editor
                if (diffEditorRef.current) {
                    diffEditorRef.current.setModel({
                        original: originalModel,
                        modified: modifiedModel
                    });
                }

                previousModelRef.current = modifiedModel;
            } else {
                const model = monaco.editor.createModel(editorContent, language, uri);

                // Set the model to the editor
                if (editorRef.current) {
                    editorRef.current.setModel(model);
                    editorRef.current.setScrollPosition({ scrollTop: 0 });
                }

                previousModelRef.current = model;
            }

            modelPathRef.current = currentPath;
            initialContentRef.current = editorContent;
        }

        return () => {
            // No need to dispose here, we'll handle it when switching files
        };
    }, [selectedFile?.path, monacoRef.current, showDiff, previousContent]);

    // Update model content when editorContent changes (streaming updates)
    useEffect(() => {
        if (showDiff) return; // Don't update content in diff mode

        if (!editorRef.current || !previousModelRef.current) return;

        const editor = editorRef.current;
        const model = editor.getModel();

        if (model) {
            // Get current cursor position and selections
            const selections = editor.getSelections();
            const viewState = editor.saveViewState();

            // Update content without triggering onChange
            const edits = [{
                range: model.getFullModelRange(),
                text: editorContent
            }];

            model.pushEditOperations(selections || [], edits, () => null);

            // Restore cursor position and selections if not auto-scrolling
            if (!shouldAutoScroll && viewState) {
                editor.restoreViewState(viewState);
            } else if (isInitialLoadRef.current) {
                // Scroll to top on initial load of a file
                editor.setScrollPosition({ scrollTop: 0 });
                isInitialLoadRef.current = false;
            }

            // Store initial content for comparison
            if (selectedFile?.path !== modelPathRef.current) {
                initialContentRef.current = editorContent;
            }
        }
    }, [editorContent, shouldAutoScroll, selectedFile?.path, showDiff]);

    // Auto-scroll logic - only for streaming content
    useEffect(() => {
        if (shouldAutoScroll && selectedFile?.path === modelPathRef.current) {
            const editor = showDiff ? diffEditorRef.current?.getModifiedEditor() : editorRef.current;
            if (editor) {
                const lineCount = editor.getModel()?.getLineCount() || 0;
                editor.revealLine(lineCount, 1);
            }
        }
    }, [editorContent, shouldAutoScroll, showDiff, selectedFile?.path]);

    // Handle editor scroll events
    const handleEditorScroll = (e: Monaco.IScrollEvent) => {
        const editor = showDiff ? diffEditorRef.current?.getModifiedEditor() : editorRef.current;
        if (!editor) return;

        const scrollTop = e.scrollTop;
        const scrollHeight = editor.getScrollHeight();
        const clientHeight = editor.getLayoutInfo().height;

        // Consider user at bottom if within 100px of bottom
        const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 100;
        setShouldAutoScroll(isAtBottom);
    };

    const beforeMount = (monaco: typeof Monaco) => {
        if (!monaco) return

        // Enable eager model sync for better IntelliSense
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        // Set TypeScript configuration
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.ESNext,
            noEmit: true,
            esModuleInterop: true,
            jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
            jsxFactory: 'React.createElement',
            reactNamespace: "React",
            allowJs: true,
            typeRoots: ["node_modules/@types"],
            strict: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            resolveJsonModule: true,
            isolatedModules: true,
            allowSyntheticDefaultImports: true,
            jsxImportSource: "react",
            types: ["react", "node"],
            jsxFragmentFactory: 'React.Fragment',
        })

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            allowNonTsExtensions: true,
            allowJs: true,
            checkJs: true
        });

        // Add React and Next.js type definitions
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            `
      declare module "react" {
          export = React;
          export as namespace React;
          namespace React {
              type ReactNode = string | number | boolean | null | undefined | React.ReactElement | React.ReactFragment | React.ReactPortal;
              interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
                  type: T;
                  props: P;
                  key: Key | null;
              }
              type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
              interface FunctionComponent<P = {}> {
                  (props: P, context?: any): ReactElement<any, any> | null;
                  displayName?: string;
              }
              type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);
              type Key = string | number;
          }
      }

      declare module "next/font/google" {
          export interface FontOptions {
              weight?: string | number | Array<string | number>;
              style?: string | string[];
              subsets?: string[];
          }

          export function Inter(options: FontOptions): {
              className: string;
              style: { fontFamily: string };
          };
      }

      declare module "@/components/theme-provider" {
          export interface ThemeProviderProps {
              attribute?: string;
              defaultTheme?: string;
              enableSystem?: boolean;
              children?: React.ReactNode;
          }
          export const ThemeProvider: React.FC<ThemeProviderProps>;
      }

      declare module "@/components/mode-toggle" {
          export const ModeToggle: React.FC;
      }
      `,
            'next-types.d.ts'
        )

        // Add common module declarations
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            `
      declare module "*.css" {
          const content: { [className: string]: string };
          export default content;
      }
      declare module "*.svg" {
          const content: React.FC<React.SVGProps<SVGSVGElement>>;
          export default content;
      }
      declare module "*.png" {
          const content: string;
          export default content;
      }
      declare module "*.jpg" {
          const content: string;
          export default content;
      }
      `,
            'global.d.ts'
        )

        // Configure TypeScript/JavaScript language features
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        })

        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
            noSuggestionDiagnostics: false,
            diagnosticCodesToIgnore: [8006, 8010]
        });

        // window.MonacoEnvironment = {
        //   getWorkerUrl: (_, label) => {
        //     console.log(label)
        //     const workerPath = `/_next/static/chunks/monaco-editor-workers/${label}.worker.js`;
        //     return workerPath;
        //   }
        // };
        // Add cleanup function
        return () => {
            // Dispose of any existing models to prevent memory leaks
            monaco.editor.getModels().forEach(model => model.dispose());
        };
    }

    const handleDiffEditorDidMount = (editor: editor.IStandaloneDiffEditor, monaco: typeof Monaco) => {
        diffEditorRef.current = editor;
        monacoRef.current = monaco;

        // Add scroll listener to modified editor
        editor.getModifiedEditor().onDidScrollChange(handleEditorScroll);

        // Ensure editor is properly disposed on unmount
        return () => {
            editor.dispose();
        };
    };

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Add scroll listener
        editor.onDidScrollChange(handleEditorScroll);

        // Disable undo/redo stack when switching files
        editor.createContextKey('isFileGenerating', false);

        // Override default undo/redo behavior
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
            // Only allow undo if we have actual edits in the current file
            if (editor.hasTextFocus() && (editor?.getModel()?.getAlternativeVersionId() || 0) > 2) {
                editor.trigger('keyboard', 'undo', null);

                // Prevent auto-scrolling to bottom after undo
                setShouldAutoScroll(false);
            }
        });

        // Add custom onChange handler to ensure we detect all changes
        editor.onDidChangeModelContent(() => {
            if (editor.getModel()) {
                const currentValue = editor.getModel()?.getValue();
                // handleEditorChange(currentValue);
            }
        });

        // Ensure editor is properly disposed on unmount
        return () => {
            editor.dispose();
        };
    };

    // Get language for syntax highlighting
    const getLanguage = (filename: string) => {
        const extension = filename.split('.').pop()?.toLowerCase() || ''

        const languageMap: Record<string, string> = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            html: 'html',
            css: 'css',
            json: 'json',
            md: 'markdown',
            py: 'python',
            rb: 'ruby',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            cs: 'csharp',
            go: 'go',
            php: 'php',
            sql: 'sql',
            yaml: 'yaml',
            yml: 'yaml',
        }

        return languageMap[extension] || 'plaintext'
    }

    // Extract filename from path
    const getFileName = (path: string): string => {
        return path.split('/').pop() || path
    }

    return showDiff ? (
        <div className="">
            <DiffEditor
                height="100%"
                language={getLanguage(getFileName(selectedFile?.path || ''))}
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                original={previousContent}
                modified={editorContent}
                onMount={handleDiffEditorDidMount}
                beforeMount={beforeMount}
                options={{
                    ...commonEditorOptions,
                    readOnly: true,
                    originalEditable: false,
                    renderSideBySide: !isMobile,
                    renderIndicators: true,
                    enableSplitViewResizing: !isMobile,
                    lineNumbers: isMobile ? 'off' : 'on',
                    wordWrap: isMobile ? 'on' : 'off',
                }}
            />
        </div>
    ) : (
        <div className="flex-1 h-full flex">
            <Editor
                height="100%"
                language={getLanguage(getFileName(selectedFile?.path || ''))}
                theme={theme === 'dark' ? 'vs-dark' : 'vs'}
                value={editorContent}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                beforeMount={beforeMount}
                options={{
                    ...commonEditorOptions,
                    readOnly: !selectedFile || !hasAccess,
                }}
            />
        </div>
    );
} 
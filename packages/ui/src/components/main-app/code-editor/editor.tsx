"use client";

import { Editor } from "@monaco-editor/react";
import type { EditorActionsType } from "@repo/types/src/code-editor-types";
import { cn } from "@repo/ui/lib/utils.ts";
import { Button } from "@repo/ui/components/ui/button.tsx";
import { RunCodeEditorActions } from "@repo/ui/components/main-app/code-editor/run-actions-component.tsx";

interface CodeEditorProps {
  actions: EditorActionsType[];
  handleSaveAction: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

function CodeEditor({
  actions,
  handleSaveAction,
  className,
}: Readonly<CodeEditorProps>): JSX.Element {
  return (
    <div className={cn(`w-full h-full`, className)}>
      <form className="w-full h-full" onSubmit={handleSaveAction}>
        <label className="sr-only" htmlFor="comment">
          Add your code here and then click &quot;Save&quot; or &quot;Run
          action&quot;
        </label>
        <Editor
          defaultValue='// Add your code here and then click "Save" or "Run action"'
          language="typescript"
          theme="vs-dark"
        />
        <div className="flex justify-between pt-2 px-8">
          <div className="flex items-center space-x-5" />
          <div className="flex items-center justify-center gap-3">
            <RunCodeEditorActions actions={actions} />
            <div className="flex-shrink-0">
              <Button
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                type="submit"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CodeEditor;

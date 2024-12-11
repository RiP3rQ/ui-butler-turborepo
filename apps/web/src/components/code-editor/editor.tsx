"use client";

import { Editor } from "@monaco-editor/react";
import { cn } from "@repo/ui/lib/utils";
import { type Dispatch, type SetStateAction } from "react";

interface CodeEditorProps {
  codeValue: string;
  setCodeValue: Dispatch<SetStateAction<string>>;
  className?: string;
}

function CodeEditor({
  codeValue,
  setCodeValue,
  className,
}: Readonly<CodeEditorProps>): JSX.Element {
  return (
    <div className={cn(`w-full h-full`, className)}>
      <Editor
        defaultValue='// Add your code here and then click "Save" or "Run action"'
        language="typescript"
        theme="vs-dark"
        value={codeValue}
        onChange={(value) => {
          if (value) {
            setCodeValue(value);
          }
        }}
      />
    </div>
  );
}

export default CodeEditor;

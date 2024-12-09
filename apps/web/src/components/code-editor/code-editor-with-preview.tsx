import { type Dispatch, type SetStateAction } from "react";
import CodeEditor from "@/components/code-editor/editor";
import { CodePreview } from "@/components/code-editor/preview";

interface CodeEditorWithPreviewProps {
  codeValue: string;
  setCodeValue?: Dispatch<SetStateAction<string>>;
}

export function CodeEditorWithPreview({
  codeValue,
  setCodeValue,
}: Readonly<CodeEditorWithPreviewProps>): JSX.Element {
  return (
    <div className="w-full h-full grid grid-cols-5 gap-3">
      <div className="w-full h-[600px] col-span-3">
        <CodeEditor
          codeValue={codeValue}
          setCodeValue={(value) => {
            setCodeValue?.(value);
          }}
        />
      </div>
      <div className="h-full w-full col-span-2">
        <CodePreview code={codeValue} />
      </div>
    </div>
  );
}

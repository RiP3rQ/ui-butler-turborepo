// components/CodeSection.tsx
import { Loader2Icon, SaveIcon, XIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import CodeEditor from "@/components/code-editor/editor";

interface CodeSectionProps {
  code: string;
  isUpdating: boolean;
  hasChanges: boolean;
  title: string;
  onCodeChange: (code: string) => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function CodeSection({
  code,
  isUpdating,
  hasChanges,
  title,
  onCodeChange,
  onSave,
  onDiscard,
}: CodeSectionProps) {
  return (
    <div className="relative space-y-4">
      <CodeEditor codeValue={code} setCodeValue={onCodeChange} />

      {hasChanges ? (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDiscard}
            disabled={isUpdating}
          >
            <XIcon className="h-4 w-4 mr-2" />
            Discard Changes
          </Button>
          <Button size="sm" onClick={onSave} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      ) : null}

      {isUpdating ? (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <Card className="w-[300px]">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center font-medium">
                Saving {title}...
                <br />
                <span className="text-sm text-muted-foreground">
                  Please wait
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

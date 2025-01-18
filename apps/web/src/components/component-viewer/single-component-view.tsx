import { type JSX, useCallback } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { Badge } from "@repo/ui/components/ui/badge";
import { cn } from "@repo/ui/lib/utils";
import { type CodeType, type SingleComponentViewProps } from "@repo/types";
import { useComponentCode } from "@/hooks/use-component-code";
import { useCodeEditorStore } from "@/store/code-editor-store";
import { ACCORDION_ITEMS } from "@/constants/single-component-accordion-items";
import { ActionButton } from "@/components/component-viewer/single-component-view/action-button";
import { CodeSection } from "@/components/component-viewer/single-component-view/code-section";
import { CopyButton } from "@/components/copy-code-button";

export function SingleComponentView({
  componentsData,
  projectId,
  componentId,
}: SingleComponentViewProps): JSX.Element {
  const { updating, generatingCodeType, updateMutation, generateMutation } =
    useComponentCode(projectId, componentId);

  const {
    pendingChanges,
    setPendingChange,
    clearPendingChange,
    hasPendingChange,
  } = useCodeEditorStore();

  const handleCodeChange = useCallback(
    (codeType: string, newCode: string) => {
      setPendingChange(codeType, newCode);
    },
    [setPendingChange],
  );

  const handleSaveChanges = useCallback(
    (codeType: CodeType) => {
      const newCode = pendingChanges[codeType];
      if (!newCode) return;

      updateMutation.mutate({
        componentId: Number(componentId),
        codeType,
        content: newCode,
      });
      clearPendingChange(codeType);
    },
    [pendingChanges, componentId, updateMutation, clearPendingChange],
  );

  return (
    <Accordion
      type="multiple"
      className="w-full space-y-2"
      defaultValue={["item-1"]}
    >
      {ACCORDION_ITEMS.map((item) => {
        const isImplemented = item.checkImplemented(componentsData);
        const originalCode = item.getCode(componentsData);
        const currentCode = pendingChanges[item.codeType] ?? originalCode;
        const isUpdating = updating === item.codeType;
        const hasChanges = hasPendingChange(item.codeType);

        return (
          <AccordionItem
            key={item.id}
            value={item.value}
            className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <AccordionTrigger className="px-4">
              <div className="flex items-center justify-between w-full gap-4">
                <span
                  className={cn(
                    "font-medium",
                    !isImplemented && "text-amber-500",
                  )}
                >
                  {item.title}
                  {!isImplemented && (
                    <span className="text-xs text-amber-500 pl-3">
                      (Not implemented yet)
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {hasChanges ? (
                    <Badge variant="outline" className="text-yellow-500">
                      Unsaved Changes
                    </Badge>
                  ) : null}
                  <ActionButton
                    action={item.action}
                    type={item.codeType}
                    componentId={componentId}
                    isGenerating={generatingCodeType === item.codeType}
                    isAnyGenerating={generatingCodeType !== null}
                    onGenerate={() => {
                      generateMutation.mutate({
                        componentId: Number(componentId),
                        codeType: item.codeType,
                      });
                    }}
                  />
                  <div className="mx-2">
                    <CopyButton value={currentCode} />
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <CodeSection
                code={currentCode}
                isUpdating={isUpdating}
                hasChanges={hasChanges}
                title={item.title}
                onCodeChange={(newCode) => {
                  handleCodeChange(item.codeType, newCode);
                }}
                onSave={() => {
                  handleSaveChanges(item.codeType);
                }}
                onDiscard={() => {
                  clearPendingChange(item.codeType);
                }}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

"use client";

import {
  type CodeType,
  type SingleComponentApiResponseType,
} from "@repo/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/ui/button";
import { Loader2Icon, SaveIcon, XIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import CodeEditor from "@/components/code-editor/editor";
import { updateComponentCode } from "@/actions/components/update-components-code";
import { useCodeEditorStore } from "@/store/code-editor-store";
import { getErrorMessage } from "@/lib/get-error-message";

export interface SingleComponentViewProps {
  componentsData: SingleComponentApiResponseType;
  projectId: string;
  componentId: string;
}

const ACCORDION_ITEMS = [
  {
    id: "code-preview",
    value: "item-1",
    title: "Code",
    codeType: "code" as const,
    getCode: (data: SingleComponentApiResponseType) => data.code,
    checkImplemented: () => true,
  },
  {
    id: "typescript-docs",
    value: "item-2",
    title: "Typescript Docs",
    codeType: "typescriptDocs" as const,
    getCode: (data: SingleComponentApiResponseType) =>
      data.typescriptDocsCode || "",
    checkImplemented: (data: SingleComponentApiResponseType) =>
      data.hasTypescriptDocs,
  },
  {
    id: "unit-tests",
    value: "item-3",
    title: "Unit tests",
    codeType: "unitTests" as const,
    getCode: (data: SingleComponentApiResponseType) => data.unitTestsCode || "",
    checkImplemented: (data: SingleComponentApiResponseType) =>
      data.wasUnitTested,
  },
  {
    id: "e2e-tests",
    value: "item-4",
    title: "E2E tests",
    codeType: "e2eTests" as const,
    getCode: (data: SingleComponentApiResponseType) => data.e2eTestsCode || "",
    checkImplemented: (data: SingleComponentApiResponseType) =>
      data.wasE2ETested,
  },
  {
    id: "storybook",
    value: "item-5",
    title: "Storybook",
    codeType: "storybook" as const,
    getCode: (data: SingleComponentApiResponseType) => data.storybookCode || "",
    checkImplemented: (data: SingleComponentApiResponseType) =>
      data.hasStorybook,
  },
] as const;

export function SingleComponentView({
  componentsData,
  projectId,
  componentId,
}: Readonly<SingleComponentViewProps>): JSX.Element {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);
  const { mutate } = useMutation({
    mutationFn: updateComponentCode,
    onSuccess: () => {
      toast.success("Component updated successfully", {
        id: "updated-component",
      });
    },
    onError: (error) => {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, { id: "updated-component" });
    },
  });

  const {
    pendingChanges,
    setPendingChange,
    clearPendingChange,
    hasPendingChange,
  } = useCodeEditorStore();

  const handleCodeChange = (codeType: string, newCode: string) => {
    setPendingChange(codeType, newCode);
  };

  const handleSaveChanges = (codeType: string) => {
    const newCode = pendingChanges[codeType];
    if (!newCode) return;

    try {
      setUpdating(codeType);
      mutate({
        componentId: Number(componentId),
        codeType: codeType as CodeType,
        content: newCode,
      });
      toast.success(`${codeType} updated successfully`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      clearPendingChange(codeType);
      setUpdating(null);
      // @ts-expect-error Reason: queryClient has no types
      queryClient.invalidateQueries([
        "single-component",
        projectId,
        componentId,
      ]);
    }
  };

  return (
    <Accordion
      type="multiple"
      className="w-full space-y-2"
      defaultValue={["item-1"]}
    >
      {ACCORDION_ITEMS.map(
        ({ id, value, title, codeType, getCode, checkImplemented }) => {
          const isImplemented = checkImplemented(componentsData);
          const originalCode = getCode(componentsData);
          const currentCode = pendingChanges[codeType] ?? originalCode;
          const isUpdating = updating === codeType;
          const hasChanges = hasPendingChange(codeType);

          return (
            <AccordionItem
              key={id}
              value={value}
              className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-4">
                <div className="flex items-center justify-between w-full gap-4">
                  <span className="font-medium">{title}</span>
                  <div className="flex items-center gap-2">
                    {hasChanges ? (
                      <Badge variant="outline" className="text-yellow-500">
                        Unsaved Changes
                      </Badge>
                    ) : null}
                    {!isImplemented && <NotImplementedBadge />}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="relative space-y-4">
                  <CodeEditor
                    codeValue={currentCode}
                    setCodeValue={(newCode) => {
                      // @ts-ignore TODO: FIX LATER
                      handleCodeChange(codeType, newCode);
                    }}
                  />

                  {hasChanges ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearPendingChange(codeType);
                        }}
                        disabled={isUpdating}
                      >
                        <XIcon className="h-4 w-4 mr-2" />
                        Discard Changes
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          handleSaveChanges(codeType);
                        }}
                        disabled={isUpdating}
                      >
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
              </AccordionContent>
            </AccordionItem>
          );
        },
      )}
    </Accordion>
  );
}

function NotImplementedBadge(): JSX.Element {
  return (
    <Badge
      className="
        bg-amber-500 text-white
        hover:bg-amber-700
        cursor-not-allowed
        transition-colors
        px-3 py-1
        text-xs font-medium
        rounded-full
        mr-3
      "
    >
      Not implemented yet
    </Badge>
  );
}

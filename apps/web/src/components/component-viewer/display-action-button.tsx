import { Loader2Icon, type LucideIcon } from "lucide-react";
import type { UseMutateFunction } from "@tanstack/react-query";
import type { CodeType, ComponentType } from "@repo/types";
import { Button } from "@repo/ui/components/ui/button";
import { type JSX } from "react";
import { type GenerateCodeFunctionProps } from "@/actions/components/generate-code-function";
import { useConfirmationModalStore } from "@/store/confirmation-modal-store";
import { getErrorMessage } from "@/lib/get-error-message";

interface DisplayActionButtonProps {
  action?: {
    title?: string;
    icon?: LucideIcon;
  };
  type: CodeType;
  componentId: string;
  generateCodeMutation: UseMutateFunction<
    ComponentType,
    Error,
    Readonly<GenerateCodeFunctionProps>
  >;
  isGenerating: boolean;
  isAnyGenerating: boolean;
}

export function DisplayActionButton({
  action,
  type,
  componentId,
  generateCodeMutation,
  isGenerating,
  isAnyGenerating,
}: Readonly<DisplayActionButtonProps>): JSX.Element | null {
  const {
    setIsModalOpen,
    setIsPending,
    setSaveButtonDisabled,
    setConfirmationModalBasicState,
  } = useConfirmationModalStore();

  function handleGenerateCodeWithConfirmation() {
    setConfirmationModalBasicState({
      isModalOpen: true,
      modalTitle: "Confirm code generation",
      modalSubtitle: `Are you sure you want to generate code for type ${type}?`,
      saveButtonText: "Generate",
      cancelButtonText: "Cancel",
      saveButtonFunction: () => {
        try {
          setIsPending(true);
          setSaveButtonDisabled(true);
          generateCodeMutation({
            componentId: Number(componentId),
            codeType: type,
          });
        } catch (e) {
          throw new Error(getErrorMessage(e));
        } finally {
          setIsPending(false);
          setSaveButtonDisabled(false);
          setIsModalOpen(false);
        }
      },
    });
  }

  if (!action?.title || !action.icon) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateCodeWithConfirmation}
      className="mx-2"
      disabled={isAnyGenerating}
    >
      {isGenerating ? (
        <Loader2Icon className="size-4 mr-2 animate-spin" />
      ) : (
        <action.icon className="size-4 mr-2" />
      )}
      {isGenerating ? "Generating..." : action.title}
    </Button>
  );
}

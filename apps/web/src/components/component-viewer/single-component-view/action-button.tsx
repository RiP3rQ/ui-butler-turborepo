"use client";

import { Loader2Icon, type LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { type CodeType } from "@repo/types";
import { cn } from "@repo/ui/lib/utils";
import { type JSX } from "react";
import { useConfirmationModalStore } from "@/store/confirmation-modal-store";
import { getErrorMessage } from "@/lib/get-error-message";

interface ActionButtonProps {
  action?: {
    title: string;
    icon: LucideIcon;
  };
  type: CodeType;
  componentId: string;
  isGenerating: boolean;
  isAnyGenerating: boolean;
  onGenerate: () => void;
}

export function ActionButton({
  action,
  type,
  isGenerating,
  isAnyGenerating,
  onGenerate,
}: ActionButtonProps): JSX.Element | null {
  const {
    setIsModalOpen,
    setIsPending,
    setSaveButtonDisabled,
    setConfirmationModalBasicState,
  } = useConfirmationModalStore();

  if (!action?.title) return null;

  const handleClick = (): void => {
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
          onGenerate();
        } catch (e) {
          throw new Error(getErrorMessage(e));
        } finally {
          setIsPending(false);
          setSaveButtonDisabled(false);
          setIsModalOpen(false);
        }
      },
    });
  };

  const Icon = isGenerating ? Loader2Icon : action.icon;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="mx-2"
      disabled={isAnyGenerating}
    >
      <Icon className={cn("size-4 mr-2", isGenerating && "animate-spin")} />
      {isGenerating ? "Generating..." : action.title}
    </Button>
  );
}

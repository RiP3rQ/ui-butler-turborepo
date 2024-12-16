import type { LucideIcon } from "lucide-react";
import type { UseMutateFunction } from "@tanstack/react-query";
import type { CodeType, ComponentType } from "@repo/types";
import { Button } from "@repo/ui/components/ui/button";
import { type GenerateCodeFunctionProps } from "@/actions/components/generate-code-function";

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
}

export function DisplayActionButton({
  action,
  type,
  componentId,
  generateCodeMutation,
}: Readonly<DisplayActionButtonProps>): JSX.Element | null {
  if (!action?.title || !action.icon) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        generateCodeMutation({
          componentId: Number(componentId),
          codeType: type,
        });
      }}
      className="mx-2"
    >
      <action.icon className="size-4 mr-2" />
      {action.title}
    </Button>
  );
}

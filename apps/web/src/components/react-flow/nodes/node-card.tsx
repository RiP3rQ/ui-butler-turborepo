"use client";

import { cn } from "@repo/ui/lib/utils";
import { useReactFlow } from "@xyflow/react";
import useFlowValidation from "@/hooks/use-flow-validation";

interface NodeCardProps {
  nodeId: string;
  children: React.ReactNode;
  isSelected: boolean;
}
function NodeCard({
  nodeId,
  children,
  isSelected = false,
}: Readonly<NodeCardProps>): JSX.Element {
  const { getNode, setCenter } = useReactFlow();
  const { invalidInputs } = useFlowValidation();

  const hasInvalidInputs = invalidInputs.some(
    (input) => input.nodeId === nodeId,
  );

  function doubleClickHandler(): void {
    const node = getNode(nodeId);
    if (!node) {
      return;
    }

    const { position, measured } = node;

    if (!position || !measured) {
      return;
    }

    const { width, height } = measured;
    const x = position.x + width! / 2;
    const y = position.y + height! / 2;

    if (!x || !y) {
      return;
    }

    setCenter(x, y, {
      zoom: 1,
      duration: 300,
    });
  }

  return (
    <div
      className={cn(
        "rounded-md cursor-pointer bg-background border-2 border-separate w-[420px] text-xs gap-1 flex-col",
        isSelected && "border-primary",
        hasInvalidInputs && "border-2 border-destructive",
      )}
      onDoubleClick={doubleClickHandler}
    >
      {children}
    </div>
  );
}
export default NodeCard;

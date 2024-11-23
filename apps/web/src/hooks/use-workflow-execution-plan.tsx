import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import type { AppNode, WorkflowExecutionPlanError } from "@repo/types";
import { toast } from "sonner";
import { parseFlowToExecutionPlan } from "@repo/tasks-client";
import useFlowValidation from "@/hooks/use-flow-validation";

const useWorkflowExecutionPlan = () => {
  const { toObject } = useReactFlow();
  const { setInvalidInputs, clearErrors } = useFlowValidation();

  const handleError = useCallback(
    (error: WorkflowExecutionPlanError) => {
      switch (error.type) {
        case "NO_ENTRY_POINT":
          toast.error("No entry point found");
          break;
        case "INVALID_INPUTS":
          toast.error("Invalid inputs found");
          setInvalidInputs(error.invalidElements || []);
          break;
        default:
          toast.error("An error occurred while generating the execution plan");
      }
    },
    [setInvalidInputs],
  );

  const generateExecutionPlan = useCallback(() => {
    const { nodes, edges } = toObject();

    const { executionPlan, error } = parseFlowToExecutionPlan(
      nodes as AppNode[],
      edges,
    );

    if (error) {
      handleError(error);
      return;
    }

    clearErrors();
    return executionPlan;
  }, [toObject, clearErrors, handleError]);

  return generateExecutionPlan;
};

export default useWorkflowExecutionPlan;

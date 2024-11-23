"use client";
import { PlayIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useReactFlow } from "@xyflow/react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/components/ui/button";

interface ExecuteButtonProps {
  workflowId: number;
}
function ExecuteButton({ workflowId }: Readonly<ExecuteButtonProps>) {
  const router = useRouter();
  const generate = useWorkflowExecutionPlan();
  const { toObject } = useReactFlow();

  const { mutate, isPending } = useMutation({
    mutationFn: runWorkflowFunction,
    onSuccess: (data) => {
      toast.success("Workflow executed successfully", { id: "run-workflow" });
      router.push(data.url);
    },
    onError: () => {
      toast.error("Failed to execute workflow", { id: "run-workflow" });
    },
  });

  return (
    <Button
      className="flex items-center gap-2"
      disabled={isPending}
      onClick={() => {
        // Client-side validation + return in form of execution plan
        const plan = generate();
        if (!plan) {
          // Client-side validation!
          return;
        }

        toast.loading("Executing workflow...", { id: "run-workflow" });
        mutate({ workflowId, flowDefinition: JSON.stringify(toObject()) });
      }}
      variant="outline"
    >
      <PlayIcon className="size-4 stroke-orange-400" />
      Execute
    </Button>
  );
}
export default ExecuteButton;

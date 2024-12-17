"use client";

import { Button } from "@repo/ui/components/ui/button";
import { type WorkflowType } from "@repo/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirmationModalStore } from "@/store/confirmation-modal-store";
import { getErrorMessage } from "@/lib/get-error-message";
import { getUserWorkflows } from "@/actions/workflows/get-workflows";
import { runWorkflow } from "@/actions/executions/run-workflow";

interface RunWorkflowButtonProps {
  componentId: string;
}

export function RunWorkflowButton({
  componentId,
}: Readonly<RunWorkflowButtonProps>): JSX.Element {
  const router = useRouter();
  const {
    setIsModalOpen,
    setIsPending,
    setSaveButtonDisabled,
    setConfirmationModalBasicState,
  } = useConfirmationModalStore();

  const { data, isFetched } = useQuery({
    queryKey: ["workflows"],
    queryFn: getUserWorkflows,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: runWorkflow,
    onSuccess: ({ url }) => {
      toast.success("Workflow executed successfully", {
        id: "execute-workflow",
      });
      router.push(url);
    },
    onError: () => {
      toast.error("Failed to execute executions", { id: "execute-workflow" });
    },
  });

  const handleClick = (workflow: WorkflowType) => {
    setConfirmationModalBasicState({
      isModalOpen: true,
      modalTitle: `Confirm workflow run`,
      modalSubtitle: `Are you sure you want to run the workflow -> ${workflow.name}?`,
      saveButtonText: "Run Workflow",
      cancelButtonText: "I've changed my mind",
      saveButtonFunction: () => {
        try {
          toast.loading("Executing workflow...", { id: "execute-workflow" });
          setIsPending(true);
          setSaveButtonDisabled(true);
          mutate({ workflowId: workflow.id, componentId: Number(componentId) });
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

  if (!data || !isFetched) {
    return <Skeleton className="w-56 h-10" />;
  }

  return (
    <div className="w-full flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="pb-4" disabled={isPending}>
          <div className="flex-shrink-0">
            <Button type="button" variant="default">
              Run action
              <ChevronDownIcon className="size-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="">
          <DropdownMenuGroup>
            {data.map((workflow, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => {
                  handleClick(workflow);
                }}
                disabled={isPending}
              >
                {workflow.name}
                <div className="text-muted text-xs">{workflow.description}</div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

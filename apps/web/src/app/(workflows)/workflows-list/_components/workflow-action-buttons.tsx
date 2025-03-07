import { type JSX, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui/components/ui/dropdown-menu";
import { Button } from "@shared/ui/components/ui/button";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import { TooltipWrapper } from "@shared/ui/components/tooltip-wrapper";
import { DeleteWorkflowDialog } from "@/app/(workflows)/workflows-list/_components/delete-workflow-dialog";

interface WorkflowActionsProps {
  workflowName: string;
  workflowId: number;
}

export function WorkflowActionButtons({
  workflowName,
  workflowId,
}: Readonly<WorkflowActionsProps>): JSX.Element {
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  return (
    <>
      <DeleteWorkflowDialog
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        workflowId={workflowId}
        workflowName={workflowName}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            <TooltipWrapper content="More actions">
              <div className="w-full h-full flex items-center justify-start">
                <MoreVerticalIcon size={18} />
              </div>
            </TooltipWrapper>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-center">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500 flex items-center justify-center gap-2"
            onClick={() => {
              setShowDeleteDialog(true);
            }}
          >
            <TrashIcon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

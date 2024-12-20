import { type JSX } from "react";
import { UserWorkflows } from "@/app/(workflows)/workflows-list/_components/user-workflows-list";
import { CreateWorkflowDialog } from "@/app/(workflows)/workflows-list/_components/create-workflow-dialog";
import { getUserWorkflows } from "@/actions/workflows/server-actions";

export default async function WorkflowsListPage(): Promise<JSX.Element> {
  const workflows = await getUserWorkflows();

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Manage your workflows here</p>
        </div>
        <CreateWorkflowDialog />
      </div>
      <div className="w-full py-6">
        <UserWorkflows workflows={workflows} />
      </div>
    </div>
  );
}

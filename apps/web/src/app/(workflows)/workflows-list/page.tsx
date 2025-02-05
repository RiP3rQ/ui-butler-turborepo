import { type JSX } from "react";
import { UserWorkflows } from "@/app/(workflows)/workflows-list/_components/user-workflows-list";
import { CreateWorkflowDialog } from "@/app/(workflows)/workflows-list/_components/create-workflow-dialog";
import { getUserWorkflows } from "@/actions/workflows/server-actions";
import { PageHeader } from "@/components/page-header";

export default async function WorkflowsListPage(): Promise<JSX.Element> {
  const workflows = await getUserWorkflows();

  return (
    <div className="flex flex-col space-y-6 container py-6">
      <PageHeader
        title="Workflows"
        description="Manage your workflows here"
        action={<CreateWorkflowDialog />}
      />
      <UserWorkflows workflows={workflows} />
    </div>
  );
}

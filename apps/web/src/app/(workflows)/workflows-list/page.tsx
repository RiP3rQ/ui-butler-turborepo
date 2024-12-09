import { Suspense } from "react";
import { UserWorkflowsSkeleton } from "@/app/(workflows)/workflows-list/_components/user-workflows-skeleton";
import { UserWorkflows } from "@/app/(workflows)/workflows-list/_components/user-workflows-list";
import { CreateWorkflowDialog } from "@/app/(workflows)/workflows-list/_components/create-workflow-dialog";

export default function WorkflowsListPage(): JSX.Element {
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
        <Suspense fallback={<UserWorkflowsSkeleton />}>
          {/* @ts-expect-error Server Component */}
          <UserWorkflows />
        </Suspense>
      </div>
    </div>
  );
}

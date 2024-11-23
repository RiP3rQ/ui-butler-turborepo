import React, { Suspense } from "react";
import { WorkflowContent } from "@/app/(workflows)/workflow/editor/[workflowId]/_components/page-content";

export type WorkflowPageParams = Promise<{ workflowId: string }>;

const WorkflowPage = async ({
  params,
}: Readonly<{
  params: WorkflowPageParams;
}>) => {
  const { workflowId } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WorkflowContent workflowId={workflowId} />
    </Suspense>
  );
};
export default WorkflowPage;

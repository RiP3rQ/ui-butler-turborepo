import React from "react";
import { redirect } from "next/navigation";
import Editor from "@/components/react-flow/editor";
import { getWorkflowByIdFunction } from "@/actions/workflows/get-workflow-by-id";

type WorkflowPageParams = Promise<{ workflowId: string }>;

export default async function WorkflowPage({
  params,
}: {
  params: WorkflowPageParams;
}): Promise<JSX.Element> {
  const workflowId = (await params).workflowId;

  if (!workflowId) {
    return redirect("/workflows");
  }

  try {
    const workflow = await getWorkflowByIdFunction({
      workflowId,
    });

    if (!workflow) {
      redirect("/workflows-list");
    }

    return <Editor workflow={workflow} workflowId={workflowId} />;
  } catch (error) {
    console.error("Error loading workflow:", error);
    redirect("/workflows-list");
  }
}

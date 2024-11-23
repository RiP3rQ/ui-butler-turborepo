import { redirect } from "next/navigation";
import { toast } from "sonner";
import React from "react";
import { getWorkflowByIdFunction } from "@/actions/workflows/get-workflow-by-id";
import Editor from "@/components/react-flow/editor";

export async function WorkflowContent({
  workflowId,
}: Readonly<{ workflowId: string }>) {
  // const { userId } = await auth();

  const userId = "123";

  if (!userId) {
    return redirect("/sign-up");
  }

  if (!workflowId) {
    return redirect("/workflows");
  }

  console.log("workflowId", workflowId);

  const workflow = await getWorkflowByIdFunction({
    workflowId,
  });

  if (!workflow) {
    toast.error("Workflow not found");
    return redirect("/workflows");
  }

  return <Editor workflow={workflow} />;
}

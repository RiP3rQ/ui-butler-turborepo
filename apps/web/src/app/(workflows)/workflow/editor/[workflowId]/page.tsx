import { redirect } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import Editor from "@/components/react-flow/editor";
import { getWorkflowByIdFunction } from "@/actions/workflows/get-workflow-by-id";

type Params = Promise<{ workflowId: string }>;

const WorkflowPage = async ({
  params,
}: Readonly<{
  params: Params;
}>) => {
  const { workflowId } = await params;
  // TODO: Implement auth function
  // const { userId } = await auth();
  const userId = "123";

  if (!userId) {
    return redirect("/sign-up");
  }

  const workflow = await getWorkflowByIdFunction({
    workflowId: Number(workflowId),
  });

  if (!workflow) {
    toast.error("Workflow not found");
    return redirect("/workflows");
  }

  return <Editor workflow={workflow} />;
};
export default WorkflowPage;

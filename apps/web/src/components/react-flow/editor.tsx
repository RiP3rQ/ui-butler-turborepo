"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { type WorkflowsEndpoints, WorkflowStatus } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";
import Topbar from "@/components/react-flow/topbar/topbar";
import TasksMenuSidebar from "@/components/react-flow/sidebar/tasks-menu-sidebar";
import FlowEditor from "@/components/react-flow/flow-editor";
import { FlowValidationContextProvider } from "@/context/flow-validation-context";
import { getWorkflowByIdFunction } from "@/actions/workflows/server-actions";

interface EditorProps {
  workflow: WorkflowsEndpoints["getWorkflowById"]["response"];
  workflowId: string;
}

function Editor({ workflow, workflowId }: Readonly<EditorProps>): JSX.Element {
  const { data } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => getWorkflowByIdFunction({ workflowId: Number(workflowId) }),
    initialData: workflow,
  });

  return (
    <FlowValidationContextProvider>
      <ReactFlowProvider>
        <div className="flex flex-col h-full w-full overflow-hidden">
          <Topbar
            isPublished={data.workflow.status === WorkflowStatus.PUBLISHED}
            subtitle={data.workflow.name}
            title="Workflow editor"
            workflowId={data.workflow.id}
          />
          <section className="flex h-full overflow-auto">
            <TasksMenuSidebar />
            <FlowEditor workflow={data.workflow} />
          </section>
        </div>
      </ReactFlowProvider>
    </FlowValidationContextProvider>
  );
}
export default Editor;

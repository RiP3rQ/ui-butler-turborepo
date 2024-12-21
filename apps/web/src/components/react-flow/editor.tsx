"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { WorkflowStatus, type WorkflowType } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";
import Topbar from "@/components/react-flow/topbar/topbar";
import TasksMenuSidebar from "@/components/react-flow/sidebar/tasks-menu-sidebar";
import FlowEditor from "@/components/react-flow/flow-editor";
import { FlowValidationContextProvider } from "@/context/flow-validation-context";
import { getWorkflowByIdFunction } from "@/actions/workflows/server-actions";

interface EditorProps {
  workflow: WorkflowType;
  workflowId: string;
}

function Editor({ workflow, workflowId }: Readonly<EditorProps>): JSX.Element {
  const { data } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => getWorkflowByIdFunction({ workflowId }),
    initialData: workflow,
  });

  return (
    <FlowValidationContextProvider>
      <ReactFlowProvider>
        <div className="flex flex-col h-full w-full overflow-hidden">
          <Topbar
            isPublished={data.status === WorkflowStatus.PUBLISHED}
            subtitle={data.name}
            title="Workflow editor"
            workflowId={data.id}
          />
          <section className="flex h-full overflow-auto">
            <TasksMenuSidebar />
            <FlowEditor workflow={data} />
          </section>
        </div>
      </ReactFlowProvider>
    </FlowValidationContextProvider>
  );
}
export default Editor;

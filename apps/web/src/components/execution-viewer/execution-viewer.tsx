"use client";

import { getPendingChanges } from "@/actions/executions/server-actions";
import {
  getWorkflowExecutionWithPhasesDetailsFunction,
  getWorkflowPhaseDetailsFunction,
} from "@/actions/workflows/server-actions";
import CountUpWrapper from "@/components/credits/count-up-wrapper";
import { ApproveChangesDialog } from "@/components/dialogs/approve-changes-dialog";
import ExecutionLabel from "@/components/execution-viewer/execution-label";
import ExecutionPhaseStatusBadge from "@/components/execution-viewer/execution-phase-status-badge";
import ExecutionRunPhasesHeader from "@/components/execution-viewer/execution-run-phases-header";
import ExecutionRunPhasesRenderer from "@/components/execution-viewer/execution-run-phases-renderer";
import LogsViewer from "@/components/execution-viewer/logs-viewer";
import ParameterViewer from "@/components/execution-viewer/parameter-viewer";
import { dateToDurationString, protoTimestampToDate } from "@/lib/dates";
import { getPhasesTotalCost } from "@/lib/get-phases-total-cost";
import type { IExecutionPhaseStatus, WorkflowsEndpoints } from "@shared/types";
import { WorkflowExecutionStatus } from "@shared/types";
import { Badge } from "@shared/ui/components/ui/badge";
import { Separator } from "@shared/ui/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  CalendarIcon,
  CircleDashedIcon,
  ClockIcon,
  CoinsIcon,
  Loader2Icon,
} from "lucide-react";
import { type JSX, useEffect, useMemo, useState } from "react";

export type ExecutionData = Awaited<
  ReturnType<typeof getWorkflowExecutionWithPhasesDetailsFunction>
>;

interface ExecutionViewerProps {
  executionId: number;
  initialData: WorkflowsEndpoints["getWorkflowExecutions"]["response"];
}

/**
 * ExecutionViewer component displays details about a workflow execution,
 * including its phases, status, duration, and logs.
 */
export function ExecutionViewer({
  executionId,
  initialData,
}: Readonly<ExecutionViewerProps>): JSX.Element {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  const { data: executionData, status: executionStatus } = useQuery({
    queryKey: ["execution", executionId],
    queryFn: () =>
      getWorkflowExecutionWithPhasesDetailsFunction({
        executionId: String(initialData.execution.id),
      }),
    initialData,
    refetchInterval: (q) =>
      q.state.data?.execution.status === WorkflowExecutionStatus.FAILED ||
      q.state.data?.execution.status === WorkflowExecutionStatus.COMPLETED
        ? false
        : 1000,
  });

  const { data: pendingChangesData } = useQuery({
    queryKey: ["pendingChanges", executionData.execution.id],
    queryFn: () =>
      getPendingChanges({ executionId: executionData.execution.id }),
    enabled:
      executionData.execution.status ===
      WorkflowExecutionStatus.WAITING_FOR_APPROVAL,
    refetchInterval: (q) =>
      q.state.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false,
  });

  const shouldOpenApproveChangesModal = useMemo(() => {
    return Boolean(
      executionData.execution.status ===
        WorkflowExecutionStatus.WAITING_FOR_APPROVAL &&
        pendingChangesData?.pendingApproval,
    );
  }, [executionData.execution.status, pendingChangesData?.pendingApproval]);

  const isRunning =
    executionData.execution.status === WorkflowExecutionStatus.RUNNING;

  useEffect(() => {
    const allPhases = executionData.phases;
    const sortedPhases = [...allPhases].sort((a, b) =>
      protoTimestampToDate(a.startedAt) > protoTimestampToDate(b.startedAt)
        ? -1
        : 1,
    );

    const phaseToSelect = isRunning
      ? sortedPhases[0]
      : (sortedPhases.find((phase) => phase.completedAt) ?? sortedPhases[0]);

    setSelectedPhase(phaseToSelect?.id ?? null);
  }, [executionData.phases, isRunning]);

  const { data: phaseDetails, status: phaseDetailsStatus } = useQuery({
    queryKey: ["phaseDetails", selectedPhase, executionData.execution.status],
    enabled: selectedPhase !== null,
    queryFn: () =>
      getWorkflowPhaseDetailsFunction({ phaseId: selectedPhase ?? 1 }),
  });

  const duration = dateToDurationString(
    protoTimestampToDate(executionData.execution.startedAt).toISOString(),
    protoTimestampToDate(executionData.execution.completedAt).toISOString(),
  );

  const creditsConsumed = getPhasesTotalCost(executionData.phases);

  const renderPhaseContent = () => {
    if (!selectedPhase) {
      return (
        <div className="flex w-full h-full justify-center items-center flex-col gap-2">
          <div className="flex flex-col gap-1 text-center">
            <p className="font-bold text-2xl">No phase selected</p>
            <p className="text-md text-muted-foreground">
              Select a phase to view its details
            </p>
          </div>
        </div>
      );
    }

    const selectedPhaseData = executionData.phases.find(
      (phase) => phase.id === selectedPhase,
    );

    if (isRunning && selectedPhaseData && !selectedPhaseData.completedAt) {
      return (
        <div className="flex w-full h-full justify-center items-center flex-col gap-2">
          <Loader2Icon className="animate-spin" size={40} />
          <p className="font-bold">Phase is being executed, please wait...</p>
        </div>
      );
    }

    if (phaseDetailsStatus === "pending" || !phaseDetails) {
      return (
        <div className="flex w-full h-full justify-center items-center">
          <Loader2Icon className="animate-spin" size={40} />
        </div>
      );
    }

    return (
      <div className="flex flex-col py-4 container gap-4 overflow-auto">
        <div className="flex items-center gap-2">
          <Badge className="space-x-4" variant="outline">
            <div className="flex gap-1 items-center">
              <ClockIcon className="stroke-muted-foreground" size={18} />
              <span>Duration</span>
            </div>
            <span>
              {dateToDurationString(
                protoTimestampToDate(
                  phaseDetails.phase.startedAt,
                ).toISOString(),
                protoTimestampToDate(
                  phaseDetails.phase.completedAt,
                ).toISOString(),
              ) ?? "-"}
            </span>
          </Badge>
          <Badge className="space-x-4" variant="outline">
            <div className="flex gap-1 items-center">
              <CoinsIcon className="stroke-muted-foreground" size={18} />
              <span>Credits</span>
            </div>
            <span>{phaseDetails.phase.creditsCost}</span>
          </Badge>
        </div>

        <ParameterViewer
          paramsJSON={phaseDetails.phase.inputs}
          subTitle="Inputs used for this phase"
          title="Inputs"
        />

        <ParameterViewer
          paramsJSON={phaseDetails.phase.outputs}
          subTitle="Outputs generated by this phase"
          title="Outputs"
        />

        <LogsViewer
          logs={phaseDetails.logs}
          subTitle="Logs generated by this phase"
          title="Logs"
        />
      </div>
    );
  };

  return (
    <div className="flex w-full h-full">
      <ApproveChangesDialog
        executionId={executionData.execution.id}
        open={shouldOpenApproveChangesModal}
        data={pendingChangesData?.pendingApproval}
      />
      <aside className="w-[440px] min-w-[440px] max-w-[440px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden">
        <div className="py-4 px-2">
          <ExecutionLabel
            icon={CircleDashedIcon}
            label="Status"
            value={
              <div className="font-semibold capitalize flex gap-2 items-center">
                <ExecutionPhaseStatusBadge
                  status={
                    executionData.execution.status as IExecutionPhaseStatus
                  }
                />
                <span>{executionData.execution.status}</span>
              </div>
            }
          />
          <ExecutionLabel
            icon={CalendarIcon}
            label="Started at"
            value={
              <span className="lowercase">
                {executionData.execution.startedAt
                  ? formatDistanceToNow(
                      protoTimestampToDate(executionData.execution.startedAt),
                      {
                        addSuffix: true,
                      },
                    )
                  : "-"}
              </span>
            }
          />
          <ExecutionLabel
            icon={ClockIcon}
            label="Duration"
            value={
              duration ? (
                duration
              ) : (
                <Loader2Icon className="animate-spin" size={20} />
              )
            }
          />
          <ExecutionLabel
            icon={CoinsIcon}
            label="Credits"
            value={<CountUpWrapper value={creditsConsumed} />}
          />
        </div>
        <Separator />
        <ExecutionRunPhasesHeader />
        <Separator />
        <ExecutionRunPhasesRenderer
          isRunning={isRunning}
          phases={executionData.phases}
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
        />
      </aside>
      <div className="flex w-full h-full">{renderPhaseContent()}</div>
    </div>
  );
}

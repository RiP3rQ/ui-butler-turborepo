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

export function ExecutionViewer({
  executionId,
  initialData,
}: Readonly<ExecutionViewerProps>): JSX.Element {
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);

  const query = useQuery({
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

  const pendingChangesQuery = useQuery({
    queryKey: ["pendingChanges", query.data.execution.id],
    queryFn: () => getPendingChanges({ executionId: query.data.execution.id }),
    enabled:
      query.data.execution.status ===
      WorkflowExecutionStatus.WAITING_FOR_APPROVAL,
    refetchInterval: (q) =>
      q.state.data?.status === WorkflowExecutionStatus.RUNNING ? 1000 : false,
  });

  console.log("pendingChangesQuery", pendingChangesQuery);

  const shouldOpenApproveChangesModal = useMemo(() => {
    return Boolean(
      query.data.execution.status ===
        WorkflowExecutionStatus.WAITING_FOR_APPROVAL &&
        pendingChangesQuery.data?.pendingApproval,
    );
  }, [query.data.execution.status, pendingChangesQuery.data?.pendingApproval]);

  console.log("shouldOpenApproveChangesModal", shouldOpenApproveChangesModal);

  const isRunning =
    query.data.execution.status === WorkflowExecutionStatus.RUNNING;

  // currently running phase-executors
  useEffect(() => {
    // While running we auto-select the currently running phase-executors in sidebar
    const allPhases = query.data.phases;
    if (isRunning) {
      // Select the last executed phase-executors
      const phaseToSelect = [...allPhases].sort((a, b) =>
        protoTimestampToDate(a.startedAt) > protoTimestampToDate(b.startedAt)
          ? -1
          : 1,
      )[0];

      setSelectedPhase(phaseToSelect?.id ?? null);
      return;
    }
    const phaseToSelect = [...allPhases].sort((a, b) =>
      protoTimestampToDate(a.completedAt) > protoTimestampToDate(b.completedAt)
        ? -1
        : 1,
    )[0];
    setSelectedPhase(phaseToSelect?.id ?? null);
  }, [query.data.phases, isRunning, setSelectedPhase]);

  const phaseDetails = useQuery({
    queryKey: ["phaseDetails", selectedPhase, query.data.execution.status],
    enabled: selectedPhase !== null,
    queryFn: () =>
      getWorkflowPhaseDetailsFunction({ phaseId: selectedPhase ?? 1 }),
  });

  console.log("phaseDetails", phaseDetails.data);

  const duration = dateToDurationString(
    protoTimestampToDate(query.data.execution.startedAt).toISOString(),
    protoTimestampToDate(query.data.execution.completedAt).toISOString(),
  );

  const creditsConsumed = getPhasesTotalCost(query.data.phases);

  return (
    <div className="flex w-full h-full">
      <ApproveChangesDialog
        executionId={query.data.execution.id}
        open={shouldOpenApproveChangesModal}
        data={pendingChangesQuery.data?.pendingApproval}
      />
      <aside className="w-[440px] min-w-[440px] max-w-[440px] border-r-2 border-separate flex flex-grow flex-col overflow-hidden">
        <div className="py-4 px-2">
          <ExecutionLabel
            icon={CircleDashedIcon}
            label="Status"
            value={
              <div className="font-semibold capitalize flex gap-2 items-center">
                <ExecutionPhaseStatusBadge
                  status={query.data.execution.status as IExecutionPhaseStatus} // SHOULD be casted as WorkflowExecutionStatus
                />
                <span>{query.data.execution.status}</span>
              </div>
            }
          />
          <ExecutionLabel
            icon={CalendarIcon}
            label="Started at"
            value={
              <span className="lowercase">
                {query.data.execution.startedAt
                  ? formatDistanceToNow(
                      protoTimestampToDate(query.data.execution.startedAt),
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
          phases={query.data.phases}
          selectedPhase={selectedPhase}
          setSelectedPhase={setSelectedPhase}
        />
      </aside>
      <div className="flex w-full h-full">
        {/*  TODO: CREATE A CUSTOM RENDERER */}
        {isRunning ? (
          <div className="flex w-full h-full justify-center items-center flex-col gap-2">
            <div>
              <Loader2Icon className="animate-spin" size={40} />
            </div>
            <div>
              <p className="font-bold">
                Workflow is being executed, please wait...
              </p>
            </div>
          </div>
        ) : null}
        {!isRunning && !selectedPhase && (
          <div className="flex w-full h-full justify-center items-center flex-col gap-2">
            <div className="flex flex-col gap-1 text-center">
              <p className="font-bold text-2xl">No phase selected</p>
              <p className="text-md text-muted-foreground">
                Select a phase to view its details
              </p>
            </div>
          </div>
        )}
        {!isRunning && selectedPhase && phaseDetails.data ? (
          <div className="flex flex-col py-4 container gap-4 overflow-auto">
            <div className="flex items-center gap-2">
              {/*  TIME BADGE */}
              <Badge className="space-x-4" variant="outline">
                <div className="flex gap-1 items-center">
                  <ClockIcon className="stroke-muted-foreground" size={18} />
                  <span>Duration</span>
                </div>
                <span>
                  {dateToDurationString(
                    protoTimestampToDate(
                      phaseDetails.data.phase.startedAt,
                    ).toISOString(),
                    protoTimestampToDate(
                      phaseDetails.data.phase.completedAt,
                    ).toISOString(),
                  ) ?? "-"}
                </span>
              </Badge>
              {/* Creadits BADGE*/}
              <Badge className="space-x-4" variant="outline">
                <div className="flex gap-1 items-center">
                  <CoinsIcon className="stroke-muted-foreground" size={18} />
                  <span>Credits</span>
                </div>
                <span>{phaseDetails.data.phase.creditsCost}</span>
              </Badge>
            </div>

            <ParameterViewer
              paramsJSON={phaseDetails.data.phase.inputs}
              subTitle="Inputs used for this phase-executors"
              title="Inputs"
            />

            <ParameterViewer
              paramsJSON={phaseDetails.data.phase.outputs}
              subTitle="Outputs generated by this phase-executors"
              title="Outputs"
            />

            <LogsViewer
              logs={phaseDetails.data.logs}
              subTitle="Logs generated by this phase-executors"
              title="Logs"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

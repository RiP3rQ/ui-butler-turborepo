"use client";
import {
  deleteProjectFunction,
  getProjectsDetailsFunction,
} from "@/actions/projects/server-actions";
import { MultipleComponentsView } from "@/components/component-viewer/multiple-component-view";
import { protoTimestampToDate } from "@/lib/dates";
import { type ProjectDetails } from "@shared/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/ui/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { type JSX, useMemo } from "react";
import { CalendarIcon, ClockIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@shared/ui/components/ui/badge";
import { Button } from "@shared/ui/components/ui/button";
import { toast } from "sonner";
import { useModalsStateStore } from "@/store/modals-store";
import { useShallow } from "zustand/react/shallow";
import { getErrorMessage } from "@/lib/get-error-message";
import { useConfirmationModalStore } from "@/store/confirmation-modal-store";
import { ProjectDialog } from "@/components/dialogs/project-dialog";

interface ProjectCardProps {
  projectData: ProjectDetails;
  projectId: string;
}

export function ProjectCard({
  projectData,
  projectId,
}: Readonly<ProjectCardProps>): JSX.Element {
  const queryClient = useQueryClient();
  const { projectModal } = useModalsStateStore(useShallow((state) => state));
  const {
    setIsModalOpen,
    setIsPending,
    setSaveButtonDisabled,
    setConfirmationModalBasicState,
  } = useConfirmationModalStore();

  const queryKey = useMemo(() => {
    return `project-details-${String(projectData.id)}`;
  }, [projectData.id]);

  const { data } = useQuery({
    queryKey: [queryKey],
    queryFn: async () =>
      await getProjectsDetailsFunction({
        projectId: Number(projectId),
      }),
    initialData: projectData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProjectFunction,
    onSuccess: () => {
      toast.success("Deleted project successfully", {
        id: "delete-project",
      });
      queryClient.invalidateQueries({ queryKey: ["user-projects"] });
    },
    onError: () => {
      toast.error("Failed to delete project", {
        id: "delete-project",
      });
    },
  });

  return (
    <Card className="flex flex-col space-y-6 container my-6 py-2">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl"
              style={{ backgroundColor: data.color }}
            >
              {data.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle className="text-3xl font-bold">
                  {data.title}
                </CardTitle>
                <ProjectDialog
                  dialogTrigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className={"flex items-center justify-center"}
                      onClick={() => {
                        projectModal.setMode("edit");
                        projectModal.setData(data);
                        projectModal.setIsOpen(true);
                      }}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                  }
                />
              </div>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {data.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs font-semibold">
              {data.components.length} Components
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmationModalBasicState({
                  isModalOpen: true,
                  modalTitle: `Delete ${projectData.title}`,
                  modalSubtitle: `Are you sure you want to delete ${projectData.title}?`,
                  saveButtonText: "Yes, delete",
                  cancelButtonText: "I've changed my mind",
                  saveButtonFunction: () => {
                    try {
                      toast.loading("Deleting project...", {
                        id: "delete-project",
                      });
                      setIsPending(true);
                      setSaveButtonDisabled(true);
                      deleteMutation.mutate(projectData.id);
                    } catch (e) {
                      throw new Error(getErrorMessage(e));
                    } finally {
                      setIsPending(false);
                      setSaveButtonDisabled(false);
                      setIsModalOpen(false);
                    }
                  },
                });
              }}
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete Project
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-start space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>
              Created:{" "}
              {moment(protoTimestampToDate(data.createdAt)).format(
                "DD/MM/YYYY",
              )}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4" />
            <span>
              Updated:{" "}
              {moment(protoTimestampToDate(data.updatedAt)).format(
                "DD/MM/YYYY",
              )}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Project Components</h3>
          <MultipleComponentsView
            components={data.components}
            queryKey={queryKey}
          />
        </div>
      </CardContent>
    </Card>
  );
}

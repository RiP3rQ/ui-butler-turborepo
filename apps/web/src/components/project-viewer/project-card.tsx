"use client";
import { getProjectsDetailsFunction } from "@/actions/projects/server-actions";
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
import { type JSX, useMemo, useState } from "react";
import { CalendarIcon, ClockIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Badge } from "@shared/ui/components/ui/badge";
import { useRouter } from "next/navigation";
import { Input } from "@shared/ui/components/ui/input";
import { Button } from "@shared/ui/components/ui/button";
import { toast } from "sonner";

interface ProjectCardProps {
  projectData: ProjectDetails;
  projectId: string;
}

export function ProjectCard({
  projectData,
  projectId,
}: Readonly<ProjectCardProps>): JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(projectData.title);

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

  const testFunction = async () => {
    await setTimeout(() => console.log("This is a test function"), 1000);
  };

  const updateMutation = useMutation({
    mutationFn: testFunction,
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      setIsEditing(false);
      toast.success("Project name updated successfully");
    },
    onError: () => {
      toast.error("Failed to update project name");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: testFunction,
    onSuccess: () => {
      router.push("/projects");
      toast.success("Project deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  const handleUpdateProjectName = () => {
    updateMutation.mutate({ projectId: Number(projectId), title: editedTitle });
  };

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate({ projectId: Number(projectId) });
    }
  };

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
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold"
                  />
                  <Button onClick={handleUpdateProjectName} size="sm">
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-3xl font-bold">
                    {data.title}
                  </CardTitle>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                </div>
              )}
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
              onClick={handleDeleteProject}
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

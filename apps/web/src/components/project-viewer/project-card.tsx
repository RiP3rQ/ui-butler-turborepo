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
import { Label } from "@shared/ui/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { type JSX, useMemo } from "react";

interface ProjectCardProps {
  projectData: ProjectDetails;
  projectId: string;
}

export function ProjectCard({
  projectData,
  projectId,
}: Readonly<ProjectCardProps>): JSX.Element {
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

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)] w-full max-w-full px-8 py-4">
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>
            <div className="w-full flex justify-center flex-col">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-4xl flex items-center justify-center">
                  <div
                    className="size-7 rounded-full mr-2"
                    style={{
                      backgroundColor: data.color,
                    }}
                  />
                  {data.title}
                </Label>
              </div>
              <Label className="text-muted-foreground text-xl">
                <span className="text-sm">{data.description}</span>
              </Label>
            </div>
          </CardTitle>
          <CardDescription>
            <div className="flex items-center justify-between w-full space-x-4">
              <div>
                Created at:{" "}
                <span>
                  {moment(protoTimestampToDate(data.createdAt)).format(
                    "DD/MM/YYYY",
                  )}
                </span>
              </div>
              <div>
                Updated at:{" "}
                <span>
                  {moment(protoTimestampToDate(data.updatedAt)).format(
                    "DD/MM/YYYY",
                  )}
                </span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="h-fit w-full">
          <MultipleComponentsView
            components={data.components}
            queryKey={queryKey}
          />
        </CardContent>
      </Card>
    </div>
  );
}

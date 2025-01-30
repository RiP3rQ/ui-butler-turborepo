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
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { type JSX, useMemo } from "react";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Badge } from "@shared/ui/components/ui/badge";

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
    <Card className="w-full max-w-4xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
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
              <CardTitle className="text-3xl font-bold">{data.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {data.description}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {data.components.length} Components
          </Badge>
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

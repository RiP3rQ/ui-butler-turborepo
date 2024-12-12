"use client";

import { type ProjectType } from "@repo/types";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";
import { NewProjectDialog } from "@/components/dialogs/new-project-dialog";
import { useModalsStateStore } from "@/store/modals-store";
import { getUserProjects } from "@/actions/projects/get-user-projects";

interface DashboardGridProps {
  initialData: ProjectType[];
}

export function DashboardGrid({
  initialData,
}: Readonly<DashboardGridProps>): JSX.Element {
  const { createNewProjectModal } = useModalsStateStore(
    useShallow((state) => state),
  );

  const { data } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
    initialData,
  });

  return (
    <div className="w-full h-full mx-1 space-y-4">
      <div className="flex justify-between items-center ">
        <h2 className="text-3xl font-bold">
          All project{" "}
          <span className="text-xs font-light text-gray-400">
            (your top 10 projects)
          </span>
        </h2>
        <NewProjectDialog
          dialogTrigger={
            <Button
              variant="default"
              size="default"
              onClick={() => {
                createNewProjectModal.setIsOpen(true);
              }}
            >
              Add new project
            </Button>
          }
        />
      </div>

      <div className="grid gap-3 lg:gap-8 grid-cols-3 lg:grid-cols-5 min-h-[120px]">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-md flex flex-col items-center justify-center border-2 border-white"
            style={{ backgroundColor: item.color }}
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>{item.title}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-sm font-light">
              {item.numberOfComponents
                ? `${item.numberOfComponents} components`
                : "0"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

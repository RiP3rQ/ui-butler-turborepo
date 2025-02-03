"use client";

import { getUserProjects } from "@/actions/projects/server-actions";
import { useModalsStateStore } from "@/store/modals-store";
import { type Project } from "@shared/types";
import { Button } from "@shared/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type JSX } from "react";
import { useShallow } from "zustand/react/shallow";
import Link from "next/link";
import { Card } from "@shared/ui/components/ui/card";
import CountUpWrapper from "@/components/credits/count-up-wrapper";
import { ProjectDialog } from "@/components/dialogs/project-dialog";

interface DashboardGridProps {
  initialData: Project[];
}

export function DashboardGrid({
  initialData,
}: Readonly<DashboardGridProps>): JSX.Element {
  const { projectModal } = useModalsStateStore(useShallow((state) => state));

  const { data } = useQuery({
    queryKey: ["user-projects"],
    queryFn: getUserProjects,
    initialData,
  });

  return (
    <div className="w-full h-full mx-1 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          All projects{" "}
          <span className="text-xs font-light text-gray-400">
            (your top 10 projects)
          </span>
        </h2>
        <ProjectDialog
          dialogTrigger={
            <Button
              variant="default"
              size="default"
              onClick={() => {
                projectModal.setMode("create");
                projectModal.setIsOpen(true);
              }}
            >
              Add new project
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 min-h-[120px]">
        {data.map((item) => (
          <Card
            key={item.id}
            className="p-4 rounded-lg shadow-md flex flex-col items-center justify-center border-2 border-gray-200  hover:shadow-lg transition-shadow duration-300"
          >
            <Link
              href={`/projects/${String(item.id)}`}
              className="w-full text-center"
            >
              <span
                className="w-3 h-3 rounded-full mr-2 inline-block"
                style={{ backgroundColor: item.color }}
              />
              <h3 className="text-xl font-semibold flex items-center justify-center">
                {item.title}
              </h3>
              <p className="text-sm font-light flex items-center justify-center">
                <CountUpWrapper value={Number(item.numberOfComponents ?? 0)} />
                &nbsp;components
              </p>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

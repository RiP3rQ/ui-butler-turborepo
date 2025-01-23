"use client";

import { getDashboardTableFavoritedContent } from "@/actions/dashboard/server-actions";
import { columns } from "@/components/dashboard/table/columns";
import { type FavoritedComponent } from "@shared/types";
import { DataTable } from "@shared/ui/components/table/data-table";
import { Button } from "@shared/ui/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type JSX } from "react";

interface DashboardFavoritedTableProps {
  initialData?: FavoritedComponent[];
}

export function DashboardFavoritedTable({
  initialData,
}: Readonly<DashboardFavoritedTableProps>): JSX.Element {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["dashboard-favorited-components"],
    queryFn: getDashboardTableFavoritedContent,
    initialData,
  });

  console.log("data", data);

  return (
    <div className="w-full h-full mx-1 space-y-4">
      <div className="flex justify-between items-center ">
        <h2 className="text-3xl font-bold">Favorited components </h2>
        <Button
          variant="default"
          size="default"
          onClick={() => {
            router.push("/save-component");
          }}
        >
          Save component
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data ?? []}
        hideFilterInput
        filterKey="Name"
      />
    </div>
  );
}

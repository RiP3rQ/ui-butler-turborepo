"use client";

import { type DashboardTableFavoritedContentResponse } from "@repo/types";
import { DataTable } from "@repo/ui/components/table/data-table";
import { Button } from "@repo/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { columns } from "@/components/dasboard/table/columns";
import { getDashboardTableFavoritedContent } from "@/actions/dashboard/get-dashboard-table-favorited-content";

interface DashboardFavoritedTableProps {
  initialData: DashboardTableFavoritedContentResponse[];
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

  return (
    <div className="w-full h-full mx-1 space-y-4">
      <div className="flex justify-between items-center ">
        <h2 className="text-3xl font-bold">Favorited components </h2>
        <Button
          variant="default"
          size="default"
          onClick={() => {
            router.push("/create-new-component");
          }}
        >
          Create new component
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        hideFilterInput
        filterKey="Name"
      />
    </div>
  );
}

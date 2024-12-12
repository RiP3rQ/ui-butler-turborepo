"use client";
import {
  ComponentIcon,
  FolderGit2Icon,
  MessageCircleHeartIcon,
} from "lucide-react";
import type { DashboardStatCardsValuesResponse } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import SingleStatCard from "@/components/analytics/stat-cards/single-stat-card";
import { getDashboardStatCardsValues } from "@/actions/dashboard/get-dashboard-stat-cards-values";

interface StatCardsProps {
  initialData: DashboardStatCardsValuesResponse;
}

function DashboardStatCards({
  initialData,
}: Readonly<StatCardsProps>): JSX.Element {
  const { data } = useQuery({
    queryKey: ["dashboard-stat-cards"],
    queryFn: getDashboardStatCardsValues,
    initialData,
  });

  return (
    <div className="grid gap-3 lg:gap-8 lg:grid-cols-3 min-h-[120px]">
      <SingleStatCard
        icon={FolderGit2Icon}
        title="Projects"
        value={data.currentActiveProjects}
      />
      <SingleStatCard
        icon={ComponentIcon}
        title="Components"
        value={data.numberOfCreatedComponents}
      />
      <SingleStatCard
        icon={MessageCircleHeartIcon}
        title="Favorited"
        value={data.favoritesComponents}
      />
    </div>
  );
}

export default DashboardStatCards;

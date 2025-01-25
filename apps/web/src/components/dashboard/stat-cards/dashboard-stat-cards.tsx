"use client";
import { getDashboardStatCardsValues } from "@/actions/dashboard/server-actions";
import SingleStatCard from "@/components/analytics/stat-cards/single-stat-card";
import type { DashboardStats } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import {
  ComponentIcon,
  FolderGit2Icon,
  MessageCircleHeartIcon,
} from "lucide-react";
import { type JSX } from "react";

interface StatCardsProps {
  initialData: DashboardStats;
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
        value={Number(data.currentActiveProjects)}
      />
      <SingleStatCard
        icon={ComponentIcon}
        title="Components"
        value={Number(data.numberOfCreatedComponents)}
      />
      <SingleStatCard
        icon={MessageCircleHeartIcon}
        title="Favorited"
        value={Number(data.favoritesComponents)}
      />
    </div>
  );
}

export default DashboardStatCards;

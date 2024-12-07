"use client";
import {
  ComponentIcon,
  FolderGit2Icon,
  MessageCircleHeartIcon,
} from "lucide-react";
import type { DashboardStatCardsValuesResponse } from "@repo/types";
import SingleStatCard from "@/components/analytics/stat-cards/single-stat-card";

interface StatCardsProps {
  data: DashboardStatCardsValuesResponse;
}

function DashboardStatCards({ data }: Readonly<StatCardsProps>): JSX.Element {
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

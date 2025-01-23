"use client";

import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/ui/components/ui/card";
import { type JSX } from "react";
import CountUpWrapper from "@/components/credits/count-up-wrapper";

interface SingleStatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
}
function SingleStatCard({
  title,
  value,
  icon: Icon,
}: Readonly<SingleStatCardProps>): JSX.Element {
  return (
    <Card className="relative overflow-hidden h-full">
      <CardHeader className="flex pb-2">
        <CardTitle>{title}</CardTitle>
        <Icon
          className="absolute -bottom-4 text-muted-foreground -right-8 stroke-primary opacity-10"
          size={120}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          <CountUpWrapper value={value} />
        </div>
      </CardContent>
    </Card>
  );
}
export default SingleStatCard;

"use client";
import { getAvailableCredits } from "@/actions/billing/server-actions";
import CountUpWrapper from "@/components/credits/count-up-wrapper";
import { type UserCredits } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { CoinsIcon } from "lucide-react";
import { type JSX } from "react";

interface BalanceCardContentProps {
  initialData: UserCredits;
}

export function BalanceCardContent({
  initialData,
}: Readonly<BalanceCardContentProps>): JSX.Element {
  const { data } = useQuery({
    queryKey: ["user-balance"],
    queryFn: getAvailableCredits,
    initialData,
  });

  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Available Credits
        </h3>
        <p className="text-4xl font-bold text-primary">
          <CountUpWrapper value={data.credits} />
        </p>
      </div>

      <CoinsIcon
        size={140}
        className="text-primary opacity-20 absolute bottom-0 right-0"
      />
    </div>
  );
}

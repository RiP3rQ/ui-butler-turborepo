"use client";
import { CoinsIcon } from "lucide-react";
import { type UserBasicCredits } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import CountUpWrapper from "@/components/credits/count-up-wrapper";
import { getAvailableCredits } from "@/actions/billing/get-available-credits";

interface BalanceCardContentProps {
  initialData: UserBasicCredits;
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

"use client";
import { CoinsIcon } from "lucide-react";
import { type UserBasicCredits } from "@repo/types";
import CountUpWrapper from "@/components/credits/count-up-wrapper";

interface BalanceCardContentProps {
  userBalance: UserBasicCredits;
}

export function BalanceCardContent({
  userBalance,
}: Readonly<BalanceCardContentProps>): JSX.Element {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Available Credits
        </h3>
        <p className="text-4xl font-bold text-primary">
          <CountUpWrapper value={userBalance.credits} />
        </p>
      </div>

      <CoinsIcon
        size={140}
        className="text-primary opacity-20 absolute bottom-0 right-0"
      />
    </div>
  );
}

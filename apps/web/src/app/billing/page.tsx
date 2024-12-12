import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import BalanceCard from "@/app/(dashboard)/billing/_components/balance-card";
import CreditsPurchaseBundles from "@/app/(dashboard)/billing/_components/credits-purchase-bundles";

interface Props {}

function BillingPage(props: Props) {
  return (
    <div>
      <h1 className="text-3xl font-bold" />
      <Suspense fallback={<Skeleton className="h-[166px] w-full" />}>
        <BalanceCard />
      </Suspense>
      <div className="my-4">
        <CreditsPurchaseBundles />
      </div>
    </div>
  );
}

export default BillingPage;

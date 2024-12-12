import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import BalanceCard from "@/components/billing/balance-card";
import { CreditsPurchaseBundles } from "@/components/billing/credits-purchase-bundles";

function BillingPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold" />
      <Suspense fallback={<Skeleton className="h-[166px] w-full" />}>
        {/* @ts-expect-error Server Component */}
        <BalanceCard />
      </Suspense>
      <div className="my-4">
        <CreditsPurchaseBundles />
      </div>
    </div>
  );
}

export default BillingPage;

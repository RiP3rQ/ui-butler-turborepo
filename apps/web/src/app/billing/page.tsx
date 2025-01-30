import { Card, CardContent, CardFooter } from "@shared/ui/components/ui/card";
import { type JSX } from "react";
import { CreditsPurchaseBundles } from "@/components/billing/credits-purchase-bundles";
import { BalanceCardContent } from "@/components/billing/balance-card-content";
import { getAvailableCredits } from "@/actions/billing/server-actions";
import { PageHeader } from "@/components/page-header";

export default async function BillingPage(): Promise<JSX.Element> {
  const userBalance = await getAvailableCredits();

  return (
    <div className="flex flex-col space-y-6 container py-6">
      <PageHeader
        title="Billing"
        description="Manage your credits and billing information"
      />
      <Card
        className={
          "bg-gradient-to-br from-primary/10 via-primary/5 to-background" +
          "border-primary/20 shadow-lg flex justify-between flex-col overflow-hidden"
        }
      >
        <CardContent className="p-6 relative items-center">
          <BalanceCardContent initialData={userBalance} />
        </CardContent>
        <CardFooter className="text-muted-foreground text-sm">
          When your credit balance reaches zero, your workflows will stop
          working
        </CardFooter>
      </Card>
      <CreditsPurchaseBundles />
    </div>
  );
}

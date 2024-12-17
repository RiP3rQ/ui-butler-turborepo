import { Card, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { CreditsPurchaseBundles } from "@/components/billing/credits-purchase-bundles";
import { getAvailableCredits } from "@/actions/billing/get-available-credits";
import { BalanceCardContent } from "@/components/billing/balance-card-content";

export default async function BillingPage(): Promise<JSX.Element> {
  const userBalance = await getAvailableCredits();

  return (
    <div>
      <h1 className="text-3xl font-bold" />
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
      <div className="my-4">
        <CreditsPurchaseBundles />
      </div>
    </div>
  );
}

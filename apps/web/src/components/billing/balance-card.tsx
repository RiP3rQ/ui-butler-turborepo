import { Card, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { getAvailableCredits } from "@/actions/billing/get-available-credits";
import { BalanceCardContent } from "@/components/billing/balance-card-content";

export async function BalanceCard(): Promise<JSX.Element> {
  const userBalance = await getAvailableCredits();
  return (
    <Card
      className={
        "bg-gradient-to-br from-primary/10 via-primary/5 to-background" +
        "border-primary/20 shadow-lg flex justify-between flex-col overflow-hidden"
      }
    >
      <CardContent className="p-6 relative items-center">
        <BalanceCardContent userBalance={userBalance} />
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        When your credit balance reaches zero, your workflows will stop working
      </CardFooter>
    </Card>
  );
}

export default BalanceCard;

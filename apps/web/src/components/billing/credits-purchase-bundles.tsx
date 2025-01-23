"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shared/ui/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@shared/ui/components/ui/radio-group";
import { Label } from "@shared/ui/components/ui/label";
import { Button } from "@shared/ui/components/ui/button";
import { CreditCardIcon } from "lucide-react";
import { type JSX, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type BalancePackId, CreditPacks } from "@shared/types";
import { purchaseCredits } from "@/actions/billing/server-actions";

export function CreditsPurchaseBundles(): JSX.Element {
  const queryClient = useQueryClient();
  const [selectedPack, setSelectedPack] = useState<BalancePackId | null>();

  const { mutate, isPending } = useMutation({
    mutationFn: purchaseCredits,
    onSuccess: () => {
      toast.success("Credits purchased successfully", {
        id: "purchase-credits",
      });
      queryClient.invalidateQueries({ queryKey: "user-balance" });
    },
    onError: () => {
      toast.error("Failed to purchase credits", {
        id: "purchase-credits",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          Purchase Credits
        </CardTitle>
        <CardDescription>Select a bundle to purchase credits</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          onValueChange={(value) => {
            setSelectedPack(value as BalancePackId);
          }}
          value={String(selectedPack)}
          disabled={isPending}
        >
          {CreditPacks.map((pack) => (
            <Button
              key={pack.id}
              variant="ghost"
              className="flex items-center space-x-3 bg-secondary/50 rounded-lg p-3 hover:bg-secondary"
              onClick={() => {
                if (!isPending) setSelectedPack(pack.id);
              }}
            >
              <RadioGroupItem value={pack.id} id={pack.id} />
              <Label className="flex justify-between w-full cursor-pointer">
                <span className="font-bold">
                  {pack.name} - {pack.label}
                </span>
                <span className="font-bold text-primary">
                  ${(pack.price / 100).toFixed(2)}
                </span>
              </Label>
            </Button>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!selectedPack || isPending}
          type="button"
          onClick={() => {
            if (selectedPack) {
              toast.loading("Purchasing credits...", {
                id: "purchase-credits",
              });
              mutate({ packId: selectedPack });
            }
          }}
        >
          <CreditCardIcon className="size-5 mr-2" /> Purchase Credits
        </Button>
      </CardFooter>
    </Card>
  );
}

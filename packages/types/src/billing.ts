export enum BalancePackId {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export interface CreditPack {
  id: BalancePackId;
  name: string;
  label: string;
  credits: number;
  price: number;
  stripePriceId: string;
}

export const CreditPacks: CreditPack[] = [
  {
    id: BalancePackId.SMALL,
    name: "Small Pack",
    label: "1000 Credits",
    credits: 1000,
    price: 999, // PRICE IN CENTS (9.99$)
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SMALL_PACK || "", // STRIPE PRICE ID
  },
  {
    id: BalancePackId.MEDIUM,
    name: "Medium Pack",
    label: "5000 Credits",
    credits: 5000,
    price: 3399, // PRICE IN CENTS (33.99$)
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MEDIUM_PACK || "", // STRIPE PRICE ID
  },
  {
    id: BalancePackId.LARGE,
    name: "Large Pack",
    label: "12000 Credits",
    credits: 12000,
    price: 4999, // PRICE IN CENTS (49.99$)
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LARGE_PACK || "", // STRIPE PRICE ID
  },
] as const;

export const getCreditPackById = (
  id: BalancePackId,
): CreditPack | undefined => {
  return CreditPacks.find((pack) => pack.id === id);
};

"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { type BalancePackId, getCreditPackById } from "@/types/billing";
import { getAppUrl } from "@/lib/helpers/url";

export async function purchaseCredits(packId: BalancePackId) {
  let sessionUrl = "";
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not found");
    }

    if (!packId) {
      throw new Error("Pack not found");
    }

    const selectedPack = getCreditPackById(packId);

    if (!selectedPack) {
      throw new Error("Pack not found");
    }

    // const stripePriceId = selectedPack.stripePriceId;

    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ["card"],
    //   invoice_creation: {
    //     enabled: true,
    //   },
    //   success_url: getAppUrl(`/billing`),
    //   cancel_url: getAppUrl(`/billing`),
    //   metadata: {
    //     userId,
    //     packId,
    //   },
    //   line_items: [
    //     {
    //       price: stripePriceId,
    //       quantity: 1,
    //     },
    //   ],
    // });

    // if (!session.url) {
    //   throw new Error("Error while creating stripe session");
    // }
    // sessionUrl = session.url;
    sessionUrl = getAppUrl(`/billing`);
  } catch (e) {
    console.error(e);
    throw new Error("Error while setting up user");
  }

  redirect(sessionUrl);
}

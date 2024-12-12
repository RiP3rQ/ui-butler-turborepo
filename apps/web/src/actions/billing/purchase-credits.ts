"use server";

import { type BalancePackId, type UserBasicCredits } from "@repo/types";
import { cookies } from "next/headers";
import { getErrorMessage } from "@/lib/get-error-message";

interface PurchaseCreditsProps {
  packId: BalancePackId;
}

export async function purchaseCredits({
  packId,
}: Readonly<PurchaseCreditsProps>): Promise<UserBasicCredits> {
  try {
    // Get existing cookies
    const cookieStore = await cookies();
    const cookiesToSend = cookieStore.getAll(); // Get all cookies or specific ones as needed

    // Convert cookies to a string format suitable for the 'Cookie' header
    const cookieHeader = cookiesToSend
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/billing/purchase-pack?packId=${packId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader, // Include cookies in the request
        },
      },
    );
    if (!res.ok) {
      throw new Error("User or Pack not found");
    }

    return (await res.json()) as UserBasicCredits;
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
}

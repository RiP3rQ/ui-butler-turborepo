"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function getAvailableCredits() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not found");
    }

    const balance = await prisma.userBalance.findUnique({
      where: {
        userId,
      },
    });

    if (!balance) {
      throw new Error("Balance not found");
    }

    return balance.balance;
  } catch (e) {
    console.error(e);
    return -1;
  }
}

// TODO: TRY...CATCH...

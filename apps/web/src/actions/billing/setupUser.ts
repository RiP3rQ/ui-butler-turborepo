"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function setupUser() {
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
      // Free credits assigning to user
      await prisma.userBalance.create({
        data: {
          userId,
          balance: 100,
        },
      });
    }
  } catch (e) {
    console.error(e);
    throw new Error("Error while setting up user");
  }

  redirect("/");
}

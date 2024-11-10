"use server";

import { redirect } from "next/navigation";
import { getAuthCookie } from "@/helpers/auth-cookie";
import { cookies } from "next/headers";
import { z } from "zod";
import { registerFormSchema } from "@/schemas/register-schema.ts";

export default async function registerUser(
  formData: z.infer<typeof registerFormSchema>,
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );

    if (!res.ok) {
      throw new Error("Registration failed");
    }
    const cookie = getAuthCookie(res);
    const cookieStore = await cookies();

    if (cookie?.accessToken) {
      cookieStore.set(cookie.accessToken);
    }

    if (cookie?.refreshToken) {
      cookieStore.set(cookie.refreshToken);
    }
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(errorMessage);
  }
  redirect(`${process.env.NEXT_PUBLIC_MAIN_APP_URL}`);
}

"use server";

import { redirect } from "next/navigation";
import { getAuthCookie } from "@/helpers/auth-cookie";
import { cookies } from "next/headers";
import { z } from "zod";
import { loginFormSchema } from "@/schemas/login-schema.ts";

export default async function loginUser(
  formData: z.infer<typeof loginFormSchema>,
) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      throw new Error("Credentials are invalid");
    }
    const cookie = getAuthCookie(res);
    if (cookie?.accessToken) {
      (await cookies()).set(cookie.accessToken);
    }
    if (cookie?.refreshToken) {
      (await cookies()).set(cookie.refreshToken);
    }
  } catch (error) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    throw new Error(errorMessage);
  }

  redirect(`${process.env.NEXT_PUBLIC_MAIN_APP_URL}`);
}

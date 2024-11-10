"use server";

import { redirect } from "next/navigation";
import { getAuthCookie } from "@/lib/auth-cookie.ts";
import { z } from "zod";
import { registerFormSchema } from "@/schemas/register-schema.ts";
import { getErrorMessage } from "@/lib/get-error-message.ts";
import { setResponseCookies } from "@/lib/set-cookies.ts";

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
    await setResponseCookies(cookie);
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }
  redirect(`${process.env.NEXT_PUBLIC_MAIN_APP_URL}`);
}

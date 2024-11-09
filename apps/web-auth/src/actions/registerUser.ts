"use server";

import { redirect } from "next/navigation";
import { getAuthCookie } from "@/helpers/auth-cookie";
import { cookies } from "next/headers";
import { z } from "zod";
import { registerFormSchema } from "@/schemas/register-schema.ts";

export default async function registerUser(
  formData: z.infer<typeof registerFormSchema>,
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  console.log("res", res);

  if (!res.ok) {
    return { error: "Credentials are not valid." };
  }
  const cookie = getAuthCookie(res);
  if (cookie?.accessToken) {
    (await cookies()).set(cookie.accessToken);
  }
  if (cookie?.refreshToken) {
    (await cookies()).set(cookie.refreshToken);
  }
  redirect("/sign-in");
}

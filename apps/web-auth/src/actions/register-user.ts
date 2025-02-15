"use server";

import { redirect } from "next/navigation";
import { type z } from "zod";
import { getAuthCookie } from "@/lib/auth-cookie";
import { type registerFormSchema } from "@/schemas/register-schema";
import { getErrorMessage } from "@/lib/get-error-message";
import { setResponseCookies } from "@/lib/set-cookies";
import { getApiUrl, getMainAppUrl } from "@/lib/utils";

export default async function registerUser(
  formData: z.infer<typeof registerFormSchema>,
): Promise<void> {
  let succeeded = false;
  try {
    // Delete confirm password field before sending to the server
    // @ts-expect-error - this is a temporary fix to remove the confirmPassword field
    delete formData["confirmPassword"];

    const res = await fetch(`${getApiUrl()}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("Registration failed");
    }
    const cookie = getAuthCookie(res);
    await setResponseCookies(cookie);
    succeeded = true;
  } catch (error) {
    console.error(`[ERROR] Failed to register user:`, error);
    throw new Error(getErrorMessage(error));
  }
  if (succeeded) {
    redirect(getMainAppUrl());
  }
}

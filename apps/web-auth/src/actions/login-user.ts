"use server";

import { redirect } from "next/navigation";
import { type z } from "zod";
import { getAuthCookie } from "@/lib/auth-cookie";
import { loginFormSchema } from "@/schemas/login-schema";
import { getErrorMessage } from "@/lib/get-error-message";
import { setResponseCookies } from "@/lib/set-cookies";
import { getApiUrl, getMainAppUrl } from "@/lib/utils";

export default async function loginUser(
  formData: z.infer<typeof loginFormSchema>,
): Promise<void> {
  try {
    // Validate the form data
    loginFormSchema.parse(formData);

    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error("Credentials are invalid");
    }

    const cookie = getAuthCookie(res);
    await setResponseCookies(cookie);
  } catch (error) {
    console.error(error);
    const errorMessage = getErrorMessage(error);
    throw new Error(errorMessage);
  }

  redirect(getMainAppUrl());
}

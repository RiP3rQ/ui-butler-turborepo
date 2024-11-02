"use server";

import { redirect } from "next/navigation";
import { getAuthCookie } from "../helpers/auth-cookie";
import { cookies } from "next/headers";

export default async function login(_prevState: any, formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Object.fromEntries(formData)),
  });
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

  redirect(`${process.env.NEXT_PUBLIC_MAIN_APP_URL}`);
}

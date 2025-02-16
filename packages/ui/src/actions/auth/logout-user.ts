"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  // Get the cookies
  const authCookie = cookieStore.get("Authentication");
  const refreshCookie = cookieStore.get("Refresh");

  if (!authCookie || !refreshCookie) {
    return redirect(`${process.env.NEXT_PUBLIC_AUTH_APP_URL}/sign-in`);
  }

  // Don't even need to get existing cookies if we're just clearing them
  // We just need to know the names we want to clear

  // Clear Authentication cookie with explicit settings
  cookieStore.set("Authentication", "", {
    // Empty string value instead of old value
    maxAge: 0,
    expires: new Date(0),
    path: "/", // Explicit path
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: `.${process.env.COOKIE_DOMAIN}`, // If needed for cross-subdomain
  });

  // Clear Refresh cookie with explicit settings
  cookieStore.set("Refresh", "", {
    // Empty string value instead of old value
    maxAge: 0,
    expires: new Date(0),
    path: "/", // Explicit path
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: `.${process.env.COOKIE_DOMAIN}`, // If needed for cross-subdomain
  });

  return redirect(`${process.env.NEXT_PUBLIC_AUTH_APP_URL}/sign-in`);
}

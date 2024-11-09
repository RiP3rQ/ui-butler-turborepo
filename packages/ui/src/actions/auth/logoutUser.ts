"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  // Remove the access token from the cookie
  cookieStore.delete("Authentication");
  // Remove the refresh token from the cookie
  cookieStore.delete("Refresh");
  // Redirect the user to the sign-in page
  redirect("/sign-in");
}

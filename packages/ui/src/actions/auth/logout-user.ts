"use server";

import { cookies } from "next/headers";

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  // Remove the access token from the cookie
  cookieStore.delete("Authentication");
  // Remove the refresh token from the cookie
  cookieStore.delete("Refresh");
}

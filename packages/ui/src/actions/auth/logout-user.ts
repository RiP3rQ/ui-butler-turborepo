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

  // Set the maxAge to 0 to delete the cookie
  cookieStore.set(authCookie.name, authCookie.value, {
    ...authCookie,
    maxAge: 0,
    expires: new Date(0),
  });
  // Set the maxAge to 0 to delete the cookie
  cookieStore.set(refreshCookie.name, refreshCookie.value, {
    ...refreshCookie,
    maxAge: 0,
    expires: new Date(0),
  });
}

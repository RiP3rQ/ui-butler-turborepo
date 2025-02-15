"use server";

import { cookies } from "next/headers";

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  // Remove the access token from the cookie
  cookieStore.set("Authentication", "this_will_be_deleted_anyways", {
    maxAge: 0,
    expires: new Date(0),
  });
  // Remove the refresh token from the cookie
  cookieStore.set("Refresh", "this_will_be_deleted_anyways", {
    maxAge: 0,
    expires: new Date(0),
  });
}

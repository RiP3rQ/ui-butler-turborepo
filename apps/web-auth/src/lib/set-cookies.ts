import { getAuthCookie } from "@/lib/auth-cookie";
import { cookies } from "next/headers";

export async function setResponseCookies(
  cookie: ReturnType<typeof getAuthCookie>,
): Promise<void> {
  const cookieStore = await cookies();
  if (cookie?.accessToken) {
    cookieStore.set(cookie.accessToken);
  }
  if (cookie?.refreshToken) {
    cookieStore.set(cookie.refreshToken);
  }
}

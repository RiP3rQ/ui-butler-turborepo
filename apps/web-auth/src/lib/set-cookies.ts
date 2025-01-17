import { cookies } from "next/headers";
import { type getAuthCookie } from "@/lib/auth-cookie";

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

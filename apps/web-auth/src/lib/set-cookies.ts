import { cookies } from "next/headers";
import { type ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { type getAuthCookie } from "@/lib/auth-cookie";

export async function setResponseCookies(
  cookie: ReturnType<typeof getAuthCookie>,
): Promise<void> {
  const cookieStore = await cookies();
  if (cookie?.accessToken) {
    cookieStore.set(cookie.accessToken as ResponseCookie);
  }
  if (cookie?.refreshToken) {
    cookieStore.set(cookie.refreshToken as ResponseCookie);
  }
}

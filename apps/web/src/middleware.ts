import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, getAuthCookie, REFRESH_COOKIE } from "@/lib/auth-cookie";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);

  // Quick check for valid auth cookie
  if (authCookie?.value) {
    try {
      const parts = authCookie.value.split(".");
      if (parts[1]) {
        const payload = atob(parts[1]);
        const { exp } = JSON.parse(payload) as { exp: number };
        if (exp > Date.now() / 1000) return NextResponse.next();
      }
    } catch {
      // Invalid token format, continue to refresh flow
    }
  }

  // Try refresh token
  const refreshCookie = cookieStore.get(REFRESH_COOKIE);
  if (refreshCookie) {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        headers: { Cookie: cookieStore.toString() },
        method: "POST",
      },
    );

    if (refreshRes.ok) {
      const cookies = getAuthCookie(refreshRes);
      if (cookies?.accessToken && cookies?.refreshToken) {
        const response = NextResponse.redirect(request.url);
        response.cookies.set(cookies.accessToken);
        response.cookies.set(cookies.refreshToken);
        return response;
      }
    }
  }

  return NextResponse.redirect(new URL("/sign-in", request.url));
}

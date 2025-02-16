import { type ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, getAuthCookie, REFRESH_COOKIE } from "@/lib/auth-cookie";
import { getApiUrl } from "@/lib/api-url";

export async function middleware(request: NextRequest): Promise<NextResponse> {
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
    const refreshRes = await fetch(`${getApiUrl()}/auth/refresh`, {
      headers: { Cookie: cookieStore.toString() },
      method: "POST",
    });

    if (refreshRes.ok) {
      const authCookies = getAuthCookie(refreshRes);
      if (authCookies?.accessToken && authCookies.refreshToken) {
        const response = NextResponse.redirect(request.url);
        response.cookies.set(authCookies.accessToken as ResponseCookie);
        response.cookies.set(authCookies.refreshToken as ResponseCookie);
        return response;
      }
    }
  }

  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

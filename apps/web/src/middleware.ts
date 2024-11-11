import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  AUTH_COOKIE,
  getAuthCookie,
  REFRESH_COOKIE,
} from "@/lib/auth-cookie.ts";

function isAuthCookieExpired(authCookie: RequestCookie | undefined) {
  if (!authCookie?.value) {
    return true;
  }

  try {
    const tokenParts = authCookie.value.split(".");
    if (tokenParts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const payload = JSON.parse(atob(tokenParts[1])) as { exp: number };
    const expiresAt = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000);

    return currentTime >= expiresAt;
  } catch (error) {
    console.error("Error parsing auth token:", error);
    return true;
  }
}

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | Response> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE);
  const authenticated =
    Boolean(authCookie?.value) && !isAuthCookieExpired(authCookie);

  if (authenticated) {
    // don't do anything if authenticated
    return NextResponse.next();
  }

  const refreshCookie = cookieStore.get(REFRESH_COOKIE);

  if (refreshCookie) {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        method: "POST",
      },
    );
    if (!refreshRes.ok) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    const authCookies = getAuthCookie(refreshRes);
    if (authCookies?.accessToken) {
      const response = NextResponse.redirect(request.url);
      response.cookies.set(authCookies.accessToken);
      return response;
    }
  }

  // Redirect to sign-in page if not authenticated
  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

// TODO: FIX FUNCTIONALITY

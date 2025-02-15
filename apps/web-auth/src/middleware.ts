import { cookies as getCookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { type ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { AUTH_COOKIE, getAuthCookie, REFRESH_COOKIE } from "./lib/auth-cookie";
import { getApiUrl, getMainAppUrl } from "@/lib/utils";

const unauthenticatedRoutes = ["/sign-up", "/sign-in", "/auth/google"];

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | Response | undefined> {
  const cookiesStore = await getCookies();
  const authCookies = cookiesStore.get(AUTH_COOKIE);
  console.log("authCookies", authCookies);
  const authenticated = Boolean(
    authCookies?.value &&
      // @ts-expect-error `expires` is a cookie object
      authCookies?.expires > Date.now() &&
      // @ts-expect-error `maxAge` is a cookie object
      authCookies?.maxAge,
  );

  if (authenticated) {
    // redirect to main page if authenticated
    return NextResponse.redirect(getMainAppUrl());
  }

  if (cookiesStore.get(REFRESH_COOKIE)) {
    const refreshRes = await fetch(`${getApiUrl()}/auth/refresh`, {
      headers: {
        Cookie: cookiesStore.toString(),
      },
      method: "POST",
    });
    const authCookies = getAuthCookie(refreshRes);
    if (authCookies?.accessToken) {
      const response = NextResponse.redirect(request.url);
      response.cookies.set(authCookies.accessToken as ResponseCookie);
      return response;
    }
  }

  if (
    !unauthenticatedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    )
  ) {
    return Response.redirect(new URL("/sign-up", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

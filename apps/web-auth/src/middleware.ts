import { cookies as getCookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { type ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { AUTH_COOKIE, getAuthCookie, REFRESH_COOKIE } from "./lib/auth-cookie";

const unauthenticatedRoutes = ["/sign-up", "/sign-in", "/auth/google"];

export async function middleware(
  request: NextRequest,
): Promise<NextResponse | Response | undefined> {
  const cookiesStore = await getCookies();
  const authenticated = Boolean(cookiesStore.get(AUTH_COOKIE)?.value);

  if (authenticated) {
    const mainAppUrl =
      process.env.NEXT_PUBLIC_MAIN_APP_URL ?? "http://localhost:3001/dashboard";

    // redirect to main page if authenticated
    return NextResponse.redirect(mainAppUrl);
  }

  if (cookiesStore.get(REFRESH_COOKIE)) {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api";
    const refreshRes = await fetch(`${apiUrl}/auth/refresh`, {
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

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  getAuthCookie,
  REFRESH_COOKIE,
} from "@/app/helpers/auth-cookie";

const unauthenticatedRoutes = ["/sign-up"];

export async function middleware(request: NextRequest) {
  const authenticated = !!(await cookies()).get(AUTH_COOKIE)?.value;

  if (!authenticated && (await cookies()).get(REFRESH_COOKIE)) {
    const refreshRes = await fetch(`${process.env.API_URL}/auth/refresh`, {
      headers: {
        Cookie: cookies().toString(),
      },
      method: "POST",
    });
    const authCookies = getAuthCookie(refreshRes);
    if (authCookies?.accessToken) {
      const response = NextResponse.redirect(request.url);
      response.cookies.set(authCookies.accessToken);
      return response;
    }
  }

  if (
    !authenticated &&
    !unauthenticatedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    )
  ) {
    return Response.redirect(new URL(unauthenticatedRoutes[0], request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

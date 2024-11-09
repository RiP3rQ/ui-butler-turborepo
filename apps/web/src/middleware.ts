import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  getAuthCookie,
  REFRESH_COOKIE,
} from "@/helpers/auth-cookie";

export async function middleware(request: NextRequest) {
  const authenticated = Boolean((await cookies()).get(AUTH_COOKIE)?.value);

  if (authenticated) {
    // don't do anything if authenticated
    return;
  }

  if (!authenticated && (await cookies()).get(REFRESH_COOKIE)) {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        headers: {
          Cookie: cookies().toString(),
        },
        method: "POST",
      },
    );
    const authCookies = getAuthCookie(refreshRes);
    if (authCookies?.accessToken) {
      const response = NextResponse.redirect(request.url);
      response.cookies.set(authCookies.accessToken);
      return response;
    }
  }

  if (!authenticated) {
    return Response.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

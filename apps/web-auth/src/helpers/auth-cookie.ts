import { jwtDecode } from "jwt-decode";

export const AUTH_COOKIE = "Authentication";
export const REFRESH_COOKIE = "Refresh";

export const getAuthCookie = (response: Response) => {
  const setCookieHeader = response.headers.get("Set-Cookie");
  if (!setCookieHeader) {
    return;
  }
  const accessToken = setCookieHeader
    .split(";")
    .find((cookieHeader) => cookieHeader.includes(AUTH_COOKIE))
    ?.split("=")[1];

  const refreshToken = setCookieHeader
    .split(";")
    .find((cookieHeader) => cookieHeader.includes(REFRESH_COOKIE))
    ?.split("=")[1];

  const decodeToken = (token: string | undefined) => {
    if (!token) return undefined;
    const decoded = jwtDecode(token);
    return decoded.exp ? new Date(decoded.exp * 1000) : undefined;
  };

  return {
    accessToken: accessToken && {
      name: AUTH_COOKIE,
      value: accessToken,
      secure: true,
      httpOnly: true,
      expires: decodeToken(accessToken),
    },
    refreshToken: refreshToken && {
      name: REFRESH_COOKIE,
      value: refreshToken,
      secure: true,
      httpOnly: true,
      expires: decodeToken(refreshToken),
    },
  };
};

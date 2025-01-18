import { jwtDecode } from "jwt-decode";

export const AUTH_COOKIE = "Authentication";
export const REFRESH_COOKIE = "Refresh";

export const getAuthCookie = (
  response: Response,
):
  | {
      accessToken?:
        | string
        | {
            name: string;
            value: string;
            secure: boolean;
            httpOnly: boolean;
            expires: Date;
          };
      refreshToken?:
        | string
        | {
            name: string;
            value: string;
            secure: boolean;
            httpOnly: boolean;
            expires: Date;
          };
    }
  | undefined => {
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

  return {
    accessToken: accessToken && {
      name: AUTH_COOKIE,
      value: accessToken,
      secure: true,
      httpOnly: true,
      expires: new Date((jwtDecode(accessToken).exp ?? 0) * 1000),
    },
    refreshToken: refreshToken && {
      name: REFRESH_COOKIE,
      value: refreshToken,
      secure: true,
      httpOnly: true,
      expires: new Date((jwtDecode(refreshToken).exp ?? 0) * 1000),
    },
  };
};

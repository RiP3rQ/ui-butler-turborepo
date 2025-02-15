import { jwtDecode } from "jwt-decode";

export const AUTH_COOKIE = "Authentication";
export const REFRESH_COOKIE = "Refresh";

/**
 * Types for cookie configuration and structure
 */
export interface Cookie {
  name: string;
  value: string;
  secure: boolean;
  httpOnly: boolean;
  expires: Date;
  domain?: string;
  path?: string;
  sameSite?: "Strict" | "Lax" | "None";
}

export interface AuthCookies {
  accessToken?: Cookie | string;
  refreshToken?: Cookie | string;
}

export interface DecodedToken {
  exp?: number;

  [key: string]: unknown;
}

/**
 * Constants for cookie names
 */
export const COOKIE_CONFIG = {
  AUTH_COOKIE: "Authentication",
  REFRESH_COOKIE: "Refresh",
} as const;

/**
 * Parses individual cookie string into structured object
 * @param cookieStr - Raw cookie string from Set-Cookie header
 * @returns Parsed cookie object or undefined if parsing fails
 */
export function parseCookieString(cookieStr: string):
  | {
      name: string;
      value: string;
      attributes: Record<string, string | boolean>;
    }
  | undefined {
  try {
    const parts = cookieStr.split(";").map((part) => part.trim());
    const [nameValue, ...attributes] = parts;
    if (!nameValue) return undefined;
    const [name, value] = nameValue.split("=").map((part) => part.trim());

    if (!name || !value) return undefined;

    const attributesObj: Record<string, string | boolean> = {};

    attributes.forEach((attr) => {
      const [key, val] = attr.split("=").map((part) => part.trim());
      // Handle boolean attributes like HttpOnly, Secure
      if (!key) return;
      if (!val) {
        attributesObj[key.toLowerCase()] = true;
      } else {
        attributesObj[key.toLowerCase()] = val;
      }
    });

    return {
      name,
      value,
      attributes: attributesObj,
    };
  } catch (error) {
    console.error("Error parsing cookie string:", error);
    return undefined;
  }
}

/**
 * Decodes JWT token and extracts expiration date
 * @param token - JWT token string
 * @returns Expiration date or undefined if token is invalid
 */
export function decodeToken(token: string | undefined): Date | undefined {
  if (!token) return undefined;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return typeof decoded.exp === "number" && !isNaN(decoded.exp)
      ? new Date(decoded.exp * 1000)
      : undefined;
  } catch (error) {
    console.error("Error decoding token:", error);
    return undefined;
  }
}

/**
 * Converts parsed cookie data into Cookie interface
 * @param parsedCookie - Parsed cookie data
 * @returns Structured Cookie object
 */
function createCookieObject(parsedCookie: {
  name: string;
  value: string;
  attributes: Record<string, string | boolean>;
}): Cookie {
  const { attributes } = parsedCookie;

  return {
    name: parsedCookie.name,
    value: parsedCookie.value,
    secure: Boolean(attributes.secure),
    httpOnly: Boolean(attributes.httponly),
    expires: attributes.expires
      ? new Date(attributes.expires as string)
      : (decodeToken(parsedCookie.value) ?? new Date()),
    domain: attributes.domain as string,
    path: attributes.path as string,
    sameSite: ((attributes.samesite as string)?.charAt(0).toUpperCase() +
      (attributes.samesite as string)?.slice(1).toLowerCase()) as
      | "Strict"
      | "Lax"
      | "None",
  };
}

/**
 * Main function to extract and parse authentication cookies from response
 * @param response - Response object containing Set-Cookie header
 * @returns Object containing parsed access and refresh tokens
 */
export const getAuthCookie = (response: Response): AuthCookies | undefined => {
  const setCookieHeader = response.headers.get("Set-Cookie");
  if (!setCookieHeader) {
    return undefined;
  }

  // Split multiple cookies and parse each one
  // Using a more robust splitting approach to handle commas in cookie values
  const cookieStrings = setCookieHeader.split(/,(?=[^\s])/);
  const cookies = cookieStrings.map((cookie) => parseCookieString(cookie));

  const authCookie = cookies.find(
    (cookie) => cookie?.name === COOKIE_CONFIG.AUTH_COOKIE,
  );
  const refreshCookie = cookies.find(
    (cookie) => cookie?.name === COOKIE_CONFIG.REFRESH_COOKIE,
  );

  return {
    accessToken: authCookie && createCookieObject(authCookie),
    refreshToken: refreshCookie && createCookieObject(refreshCookie),
  };
};

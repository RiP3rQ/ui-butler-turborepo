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
  accessToken?: Cookie;
  refreshToken?: Cookie;
}

export interface DecodedToken {
  exp?: number;
  [key: string]: unknown;
}

export const COOKIE_CONFIG = {
  AUTH_COOKIE: "Authentication",
  REFRESH_COOKIE: "Refresh",
} as const;

/**
 * Splits Set-Cookie header into individual cookie strings
 * Uses a more precise approach to split only on commas that separate cookies
 */
function splitSetCookieHeader(setCookieHeader: string): string[] {
  const cookies: string[] = [];
  let currentCookie = "";
  let depth = 0;

  // Iterate through the header character by character
  for (let i = 0; i < setCookieHeader.length; i++) {
    const char = setCookieHeader[i];

    // Track nested structures (if any)
    if (char === "{" || char === "[") depth++;
    if (char === "}" || char === "]") depth--;

    // Only split on commas that are followed by a known cookie name
    if (char === "," && depth === 0) {
      const nextChars = setCookieHeader.slice(i + 1).trim();
      if (
        nextChars.startsWith(COOKIE_CONFIG.AUTH_COOKIE) ||
        nextChars.startsWith(COOKIE_CONFIG.REFRESH_COOKIE)
      ) {
        cookies.push(currentCookie.trim());
        currentCookie = "";
        continue;
      }
    }

    currentCookie += char;
  }

  // Don't forget the last cookie
  if (currentCookie) {
    cookies.push(currentCookie.trim());
  }

  return cookies.filter(
    (cookie) =>
      cookie.startsWith(COOKIE_CONFIG.AUTH_COOKIE) ||
      cookie.startsWith(COOKIE_CONFIG.REFRESH_COOKIE),
  );
}

/**
 * Parses individual cookie string into structured object
 */
export function parseCookieString(cookieStr: string):
  | {
      name: string;
      value: string;
      attributes: Record<string, string | boolean>;
    }
  | undefined {
  try {
    const [nameValue, ...attributeParts] = cookieStr
      .split(";")
      .map((part) => part.trim());
    const [name, ...valueParts] = nameValue.split("=");
    const value = valueParts.join("="); // Handle values containing =

    const attributes: Record<string, string | boolean> = {};

    for (const attr of attributeParts) {
      if (!attr) continue;

      const [key, ...valParts] = attr.split("=").map((part) => part.trim());
      const val = valParts.join("="); // Handle values containing =

      if (!val) {
        attributes[key.toLowerCase()] = true;
      } else {
        attributes[key.toLowerCase()] = val;
      }
    }

    return {
      name: name.trim(),
      value: value.trim(),
      attributes,
    };
  } catch (error) {
    console.error("Error parsing cookie string:", error);
    return undefined;
  }
}

/**
 * Decodes JWT token and extracts expiration date
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
 * Creates a Cookie object from parsed cookie data
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
 */
export const getAuthCookie = (response: Response): AuthCookies | undefined => {
  const setCookieHeader = response.headers.get("Set-Cookie");
  if (!setCookieHeader) {
    return undefined;
  }

  // Split and parse cookies
  const cookieStrings = splitSetCookieHeader(setCookieHeader);
  console.log("Split cookies:", cookieStrings); // Debug log

  const cookies = cookieStrings
    .map((cookie) => parseCookieString(cookie))
    .filter(
      (cookie): cookie is NonNullable<typeof cookie> => cookie !== undefined,
    );

  console.log("Parsed cookies:", cookies); // Debug log

  const authCookie = cookies.find(
    (cookie) => cookie.name === COOKIE_CONFIG.AUTH_COOKIE,
  );
  const refreshCookie = cookies.find(
    (cookie) => cookie.name === COOKIE_CONFIG.REFRESH_COOKIE,
  );

  return {
    accessToken: authCookie && createCookieObject(authCookie),
    refreshToken: refreshCookie && createCookieObject(refreshCookie),
  };
};

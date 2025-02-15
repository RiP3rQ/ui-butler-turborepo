import { jwtDecode } from "jwt-decode";

export const AUTH_COOKIE = "Authentication";
export const REFRESH_COOKIE = "Refresh";

/**
 * Supported cookie same-site attributes
 */
export type SameSiteValue = "Strict" | "Lax" | "None" | undefined;

/**
 * Cookie configuration constants
 */
export const COOKIE_CONFIG = {
  AUTH_COOKIE: "Authentication",
  REFRESH_COOKIE: "Refresh",
  DEFAULT_DOMAIN: undefined,
  DEFAULT_PATH: "/",
  DEFAULT_SAME_SITE: undefined,
  DEFAULT_SECURE: undefined,
  DEFAULT_HTTP_ONLY: undefined,
} as const;

/**
 * Represents a parsed cookie with its attributes
 */
export interface Cookie {
  readonly name: string;
  readonly value: string;
  readonly secure: boolean;
  readonly httpOnly: boolean;
  readonly expires: Date;
  readonly domain: string;
  readonly path: string;
  readonly sameSite: SameSiteValue;
}

/**
 * Structure of authentication cookies returned by the API
 */
export interface AuthCookies {
  readonly accessToken?: Cookie;
  readonly refreshToken?: Cookie;
}

/**
 * Structure of a decoded JWT token
 */
export interface DecodedToken {
  readonly exp?: number;

  readonly [key: string]: unknown;
}

/**
 * Raw parsed cookie data before conversion to Cookie interface
 */
interface ParsedCookieData {
  readonly name: string;
  readonly value: string;
  readonly attributes: Record<string, string | boolean>;
}

/**
 * Error class for cookie parsing failures
 */
export class CookieParsingError extends Error {
  constructor(
    message: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "CookieParsingError";
  }
}

/**
 * Splits Set-Cookie header into individual cookie strings
 * @param setCookieHeader - Raw Set-Cookie header value
 * @returns Array of individual cookie strings
 * @throws {CookieParsingError} If the header cannot be split properly
 */
function splitSetCookieHeader(setCookieHeader: string): string[] {
  try {
    const cookies: string[] = [];
    let currentCookie = "";
    let depth = 0;

    for (let i = 0; i < setCookieHeader.length; i++) {
      const char = setCookieHeader[i];

      if (char === "{" || char === "[") depth++;
      if (char === "}" || char === "]") depth--;

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

    if (currentCookie) {
      cookies.push(currentCookie.trim());
    }

    return cookies.filter(
      (cookie) =>
        cookie.startsWith(COOKIE_CONFIG.AUTH_COOKIE) ||
        cookie.startsWith(COOKIE_CONFIG.REFRESH_COOKIE),
    );
  } catch (error) {
    throw new CookieParsingError("Failed to split Set-Cookie header", error);
  }
}

/**
 * Parses individual cookie string into structured object
 * @param cookieStr - Single cookie string
 * @returns Parsed cookie data
 * @throws {CookieParsingError} If the cookie string cannot be parsed
 */
function parseCookieString(cookieStr: string): ParsedCookieData {
  try {
    const [nameValue, ...attributeParts] = cookieStr
      .split(";")
      .map((part) => part.trim());

    if (!nameValue) {
      throw new CookieParsingError("Empty cookie string");
    }

    const [name, ...valueParts] = nameValue.split("=");
    const value = valueParts.join("=");

    if (!name || !value) {
      throw new CookieParsingError("Invalid cookie name or value");
    }

    const attributes: Record<string, string | boolean> = {};

    for (const attr of attributeParts) {
      if (!attr) continue;

      const [key, ...valParts] = attr.split("=").map((part) => part.trim());
      const val = valParts.join("=");

      if (key) {
        attributes[key.toLowerCase()] = val || true;
      }
    }

    return {
      name: name.trim(),
      value: value.trim(),
      attributes,
    };
  } catch (error) {
    if (error instanceof CookieParsingError) {
      throw error;
    }
    throw new CookieParsingError("Failed to parse cookie string", error);
  }
}

/**
 * Decodes JWT token and extracts expiration date
 * @param token - JWT token string
 * @returns Expiration date or undefined if invalid
 */
export function decodeToken(token: string): Date | undefined {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return typeof decoded.exp === "number" && !isNaN(decoded.exp)
      ? new Date(decoded.exp * 1000)
      : undefined;
  } catch (error) {
    console.warn("Failed to decode JWT token:", error);
    return undefined;
  }
}

/**
 * Creates a Cookie object from parsed cookie data
 * @param parsedCookie - Parsed cookie data
 * @returns Structured Cookie object
 */
function createCookieObject(parsedCookie: ParsedCookieData): Cookie {
  const { attributes } = parsedCookie;

  const sameSiteRaw = attributes.samesite as string | undefined;
  const sameSite: SameSiteValue = sameSiteRaw
    ? ((sameSiteRaw.charAt(0).toUpperCase() +
        sameSiteRaw.slice(1).toLowerCase()) as SameSiteValue)
    : COOKIE_CONFIG.DEFAULT_SAME_SITE;

  return {
    name: parsedCookie.name,
    value: parsedCookie.value,
    secure: Boolean(attributes.secure ?? COOKIE_CONFIG.DEFAULT_SECURE),
    httpOnly: Boolean(attributes.httponly ?? COOKIE_CONFIG.DEFAULT_HTTP_ONLY),
    expires: attributes.expires
      ? new Date(attributes.expires as string)
      : (decodeToken(parsedCookie.value) ?? new Date()),
    domain: (attributes.domain as string) ?? COOKIE_CONFIG.DEFAULT_DOMAIN,
    path: (attributes.path as string) ?? COOKIE_CONFIG.DEFAULT_PATH,
    sameSite,
  };
}

/**
 * Extracts and parses authentication cookies from response
 * @param response - Response object containing Set-Cookie header
 * @returns Object containing parsed access and refresh tokens
 * @throws {CookieParsingError} If cookies cannot be parsed
 */
export function getAuthCookie(response: Response): AuthCookies {
  const setCookieHeader = response.headers.get("Set-Cookie");

  if (!setCookieHeader) {
    return {};
  }

  try {
    const cookieStrings = splitSetCookieHeader(setCookieHeader);
    const cookies = cookieStrings.map(parseCookieString);

    const authCookie = cookies.find(
      (cookie) => cookie.name === COOKIE_CONFIG.AUTH_COOKIE,
    );
    const refreshCookie = cookies.find(
      (cookie) => cookie.name === COOKIE_CONFIG.REFRESH_COOKIE,
    );

    return {
      accessToken: authCookie ? createCookieObject(authCookie) : undefined,
      refreshToken: refreshCookie
        ? createCookieObject(refreshCookie)
        : undefined,
    };
  } catch (error) {
    if (error instanceof CookieParsingError) {
      console.error("Cookie parsing failed:", error.message);
      return {};
    }
    throw error;
  }
}

import { jwtDecode } from "jwt-decode";
import {
  AUTH_COOKIE,
  decodeToken,
  getAuthCookie,
  REFRESH_COOKIE,
} from "./auth-cookie";

// Mock `jwtDecode` to return a fixed expiration
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(() => ({ exp: 1700000000 })),
}));

interface MockResponse {
  headers: {
    get: (name: string) => string | null;
  };
}

function createMockResponse(headers: Record<string, string>): MockResponse {
  return {
    headers: {
      get(name: string) {
        return headers[name] ?? null;
      },
    },
  };
}

describe("getAuthCookie", () => {
  const mockAccessToken = "mockAccessToken";
  const mockRefreshToken = "mockRefreshToken";
  const mockExpiration = 1700000000;

  it("should return undefined if no Set-Cookie header is present", () => {
    const response = createMockResponse({});

    const result = getAuthCookie(response as Response);
    expect(result).toBeUndefined();
  });

  it("should correctly extract access and refresh tokens from Set-Cookie header", () => {
    const setCookieHeader = `${AUTH_COOKIE}=${mockAccessToken}; ${REFRESH_COOKIE}=${mockRefreshToken};`;
    const response = createMockResponse({
      "Set-Cookie": setCookieHeader,
    });

    const result = getAuthCookie(response as Response);

    expect(result).toEqual({
      accessToken: {
        name: AUTH_COOKIE,
        value: mockAccessToken,
        secure: true,
        httpOnly: true,
        expires: new Date(mockExpiration * 1000),
      },
      refreshToken: {
        name: REFRESH_COOKIE,
        value: mockRefreshToken,
        secure: true,
        httpOnly: true,
        expires: new Date(mockExpiration * 1000),
      },
    });
  });

  it("should return undefined for tokens not present in Set-Cookie header", () => {
    const response = createMockResponse({
      "Set-Cookie": "SomeOtherCookie=value;",
    });

    const result = getAuthCookie(response as Response);

    expect(result).toEqual({
      accessToken: undefined,
      refreshToken: undefined,
    });
  });

  it("should handle missing expiry in decoded token gracefully", () => {
    // Temporarily change the mock implementation for this test case
    (jwtDecode as jest.Mock).mockImplementation(() => ({})); // Simulate missing `exp`
    const setCookieHeader = `${AUTH_COOKIE}=${mockAccessToken}; ${REFRESH_COOKIE}=${mockRefreshToken};`;
    const response = createMockResponse({
      "Set-Cookie": setCookieHeader,
    });

    const result = getAuthCookie(response as Response);

    expect(result).toEqual({
      accessToken: {
        name: AUTH_COOKIE,
        value: mockAccessToken,
        secure: true,
        httpOnly: true,
        expires: undefined, // Adjust to expect undefined due to missing `exp`
      },
      refreshToken: {
        name: REFRESH_COOKIE,
        value: mockRefreshToken,
        secure: true,
        httpOnly: true,
        expires: undefined, // Adjust to expect undefined due to missing `exp`
      },
    });

    // Restore the default implementation if needed
    (jwtDecode as jest.Mock).mockImplementation(() => ({ exp: 1700000000 }));
  });
});

describe("decodeToken", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return undefined when token is undefined", () => {
    const result = decodeToken(undefined);
    expect(result).toBeUndefined();
  });

  it("should return undefined when token is an empty string", () => {
    const result = decodeToken("");
    expect(result).toBeUndefined();
  });

  it("should return undefined when decoded token has no exp field", () => {
    (jwtDecode as jest.Mock).mockImplementation(() => ({})); // Simulate missing exp
    const result = decodeToken("mockToken");
    expect(result).toBeUndefined();
  });

  it("should return the correct Date when decoded token has a valid exp", () => {
    const mockExp = 1700000000;
    (jwtDecode as jest.Mock).mockImplementation(() => ({ exp: mockExp })); // Simulate valid exp
    const expectedDate = new Date(mockExp * 1000);
    const result = decodeToken("mockToken");
    expect(result).toEqual(expectedDate);
  });

  it("should handle invalid exp gracefully", () => {
    (jwtDecode as jest.Mock).mockImplementation(() => ({ exp: "invalid" })); // Simulate invalid exp
    const result = decodeToken("mockToken");
    expect(result).toBeUndefined();
  });

  it("should handle zero exp in decoded token", () => {
    (jwtDecode as jest.Mock).mockImplementation(() => ({ exp: 0 })); // Simulate zero exp
    const result = decodeToken("mockToken");
    expect(result).toEqual(new Date(0));
  });

  it("should handle very large exp values correctly", () => {
    const largeExp = 9999999999;
    (jwtDecode as jest.Mock).mockImplementation(() => ({ exp: largeExp })); // Simulate large exp
    const expectedDate = new Date(largeExp * 1000);
    const result = decodeToken("mockToken");
    expect(result).toEqual(expectedDate);
  });

  it("should return undefined when jwtDecode throws an error", () => {
    (jwtDecode as jest.Mock).mockImplementation(() => {
      throw new Error("Malformed token");
    });
    const result = decodeToken("invalidToken");
    expect(result).toBeUndefined();
  });
});

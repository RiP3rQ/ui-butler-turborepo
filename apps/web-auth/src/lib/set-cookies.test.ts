import { cookies } from "next/headers";
import { setResponseCookies } from "@/lib/set-cookies";

// Mock dependencies
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/lib/auth-cookie", () => ({
  getAuthCookie: jest.fn(),
}));

describe("setResponseCookies", () => {
  const accessToken = {
    name: "access-token",
    value: "access-token-value",
    secure: true,
    httpOnly: true,
    expires: new Date("2024-11-10T14:13:41.357Z"),
  };

  const refreshToken = {
    name: "refresh-token",
    value: "refresh-token-value",
    secure: true,
    httpOnly: true,
    expires: new Date("2024-11-10T14:13:41.357Z"),
  };

  let mockCookiesSet: jest.Mock;

  beforeEach(() => {
    mockCookiesSet = jest.fn();
    (cookies as jest.Mock).mockResolvedValue({ set: mockCookiesSet });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should set both accessToken and refreshToken cookies", async () => {
    const cookie = { accessToken, refreshToken };
    await setResponseCookies(cookie as any); // TODO: FIX THIS as any

    expect(mockCookiesSet).toHaveBeenCalledTimes(2);
    expect(mockCookiesSet).toHaveBeenCalledWith(accessToken);
    expect(mockCookiesSet).toHaveBeenCalledWith(refreshToken);
  });

  it("should set only accessToken cookie if refreshToken is missing", async () => {
    const cookie = { accessToken, refreshToken: undefined };
    await setResponseCookies(cookie as any); // TODO: FIX THIS as any

    expect(mockCookiesSet).toHaveBeenCalledTimes(1);
    expect(mockCookiesSet).toHaveBeenCalledWith(accessToken);
  });

  it("should set only refreshToken cookie if accessToken is missing", async () => {
    const cookie = { accessToken: undefined, refreshToken };
    await setResponseCookies(cookie as any); // TODO: FIX THIS as any

    expect(mockCookiesSet).toHaveBeenCalledTimes(1);
    expect(mockCookiesSet).toHaveBeenCalledWith(refreshToken);
  });

  it("should not set any cookies if both tokens are missing", async () => {
    const cookie = { accessToken: undefined, refreshToken: undefined };
    await setResponseCookies(cookie);

    expect(mockCookiesSet).not.toHaveBeenCalled();
  });
});

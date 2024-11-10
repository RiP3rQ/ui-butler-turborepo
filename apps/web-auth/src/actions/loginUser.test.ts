import loginUser from "./loginUser";
import { getAuthCookie } from "@/helpers/auth-cookie";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
  })),
}));

jest.mock("@/helpers/auth-cookie", () => ({
  getAuthCookie: jest.fn(),
}));

describe("loginUser", () => {
  const formData = { email: "testuser@example.com", password: "password123" };
  const apiResponse = {
    accessToken: {
      name: "access-token",
      value: "access-token",
      secure: true,
      httpOnly: true,
      expires: new Date(),
    },
    refreshToken: {
      name: "refresh-token",
      value: "refresh-token",
      secure: true,
      httpOnly: true,
      expires: new Date(),
    },
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(apiResponse),
    });

    (
      getAuthCookie as jest.MockedFunction<typeof getAuthCookie>
    ).mockReturnValue(apiResponse);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should call fetch with correct arguments", async () => {
    const loginPromise = loginUser(formData);

    // Fast-forward all timers
    jest.runAllTimers();

    await loginPromise;

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );
  });

  it("should set cookies when login is successful", async () => {
    const loginPromise = loginUser(formData);

    jest.runAllTimers();

    await loginPromise;

    const cookiesMock = await cookies();
    expect(cookiesMock.set).toHaveBeenCalledWith(apiResponse.accessToken);
    expect(cookiesMock.set).toHaveBeenCalledWith(apiResponse.refreshToken);
  });

  it("should redirect to main app URL when login is successful", async () => {
    const loginPromise = loginUser(formData);

    jest.runAllTimers();

    await loginPromise;

    expect(redirect).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_MAIN_APP_URL}`,
    );
  });

  it("should throw an error when credentials are invalid", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    const loginPromise = loginUser(formData);

    jest.runAllTimers();

    await expect(loginPromise).rejects.toThrow("Credentials are invalid");
  });

  it("should log an error and throw an error for unexpected errors", async () => {
    const errorMessage = "Unexpected error";
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const loginPromise = loginUser(formData);

    jest.runAllTimers();

    await expect(loginPromise).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith(new Error(errorMessage));
  });
});

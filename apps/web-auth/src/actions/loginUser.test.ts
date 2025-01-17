import { redirect } from "next/navigation";
import { getAuthCookie } from "@/lib/auth-cookie";
import { getErrorMessage } from "@/lib/get-error-message";
import { setResponseCookies } from "@/lib/set-cookies";
import loginUser from "./loginUser";

// Mock dependencies
jest.mock("next/navigation", () => ({
  redirect: jest.fn(), // This should capture calls to redirect
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(), // Ensure this is a Jest mock function
  })),
}));

jest.mock("@/lib/auth-cookie", () => ({
  getAuthCookie: jest.fn(),
}));

jest.mock("@/lib/set-cookies", () => ({
  setResponseCookies: jest.fn(),
}));

jest.mock("@/lib/get-error-message", () => ({
  getErrorMessage: jest
    .fn()
    .mockImplementation((error) => error.message || JSON.stringify(error)),
}));

describe("loginUser", () => {
  const formData = { email: "testuser@example.com", password: "password123" };
  const apiResponse = {
    accessToken: {
      name: "access-token",
      value: "access-token",
      secure: true,
      httpOnly: true,
      expires: new Date("2024-11-10T14:13:41.357Z"),
    },
    refreshToken: {
      name: "refresh-token",
      value: "refresh-token",
      secure: true,
      httpOnly: true,
      expires: new Date("2024-11-10T14:13:41.357Z"),
    },
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fetch to return a successful response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => apiResponse,
    });

    // Mock the return value of getAuthCookie
    (
      getAuthCookie as jest.MockedFunction<typeof getAuthCookie>
    ).mockReturnValue(apiResponse);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should call fetch with correct arguments", async () => {
    await loginUser(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );
  });

  it("should set cookies using setResponseCookies", async () => {
    await loginUser(formData);

    expect(setResponseCookies).toHaveBeenCalledWith(apiResponse);
  });

  it("should redirect to main app URL when login is successful", async () => {
    await loginUser(formData);

    expect(redirect).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_MAIN_APP_URL}`,
    );
  });

  it("should throw an error when credentials are invalid", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false });
    console.error = jest.fn(); // Mock console.error

    await expect(loginUser(formData)).rejects.toThrow(
      "Credentials are invalid",
    );
  });

  it("should log and throw an error for unexpected errors", async () => {
    const errorMessage = "Unexpected error";
    global.fetch = jest.fn().mockRejectedValueOnce(new Error(errorMessage));
    console.error = jest.fn(); // Mock console.error

    await expect(loginUser(formData)).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith(new Error(errorMessage));
    expect(getErrorMessage).toHaveBeenCalledWith(new Error(errorMessage));
  });
});

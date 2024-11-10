import { getAuthCookie } from "@/lib/auth-cookie.ts";
import registerUser from "@/actions/registerUser.ts";
import { redirect } from "next/navigation";

// SETUP
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
  })),
}));

jest.mock("@/lib/auth-cookie.ts", () => ({
  getAuthCookie: jest.fn(),
}));

global.fetch = jest.fn();

// TEST CASES
describe("registerUser", () => {
  const formData = {
    username: "newuser",
    email: "newuser@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  const apiResponse = {
    accessToken: {
      name: "access-token",
      value: "access-token-value",
      secure: true,
      httpOnly: true,
      expires: new Date("2024-11-10T14:13:41.357Z"),
    },
    refreshToken: {
      name: "refresh-token",
      value: "refresh-token-value",
      secure: true,
      httpOnly: true,
      expires: new Date("2024-11-10T14:13:41.357Z"),
    },
  };

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

  it("should call fetch with correct arguments", async () => {
    await registerUser(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      },
    );
  });

  // TODO: FIX THIS TEST
  // it("should set cookies when registration is successful", async () => {
  //   await registerUser(formData);
  //
  //   const cookiesMock = await cookies();
  //   expect(cookiesMock.set).toHaveBeenCalledTimes(2);
  //
  //   expect(cookiesMock.set).toHaveBeenNthCalledWith(
  //     1,
  //     apiResponse.accessToken.name,
  //     apiResponse.accessToken.value,
  //     {
  //       secure: true,
  //       httpOnly: true,
  //       expires: apiResponse.accessToken.expires,
  //     },
  //   );
  //
  //   expect(cookiesMock.set).toHaveBeenNthCalledWith(
  //     2,
  //     apiResponse.refreshToken.name,
  //     apiResponse.refreshToken.value,
  //     {
  //       secure: true,
  //       httpOnly: true,
  //       expires: apiResponse.refreshToken.expires,
  //     },
  //   );
  // });

  it("should redirect to main app URL when registration is successful", async () => {
    await registerUser(formData);

    expect(redirect).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_MAIN_APP_URL}`,
    );
  });

  it("should throw an error when registration fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await expect(registerUser(formData)).rejects.toThrow("Registration failed");
  });

  it("should log an error and throw an error for unexpected errors", async () => {
    const errorMessage = "Unexpected error";
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await expect(registerUser(formData)).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith(new Error(errorMessage));
  });
});

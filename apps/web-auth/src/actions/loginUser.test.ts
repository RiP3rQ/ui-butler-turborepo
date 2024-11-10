import loginUser from "./loginUser";
import { getAuthCookie } from "@/helpers/auth-cookie";
import { redirect } from "next/navigation";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(), // This should capture calls to redirect
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(), // Ensure this is a Jest mock function
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

    // Ensure getAuthCookie is typed correctly as a Jest mock
    (
      getAuthCookie as jest.MockedFunction<typeof getAuthCookie>
    ).mockReturnValue(apiResponse);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should call fetch with correct arguments", async () => {
    const loginPromise = loginUser(formData);

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

  // TODO: FIX THIS TEST CASE
  // it("should set cookies correctly when login is successful", async () => {
  //   const loginPromise = loginUser(formData);
  //
  //   jest.runAllTimers();
  //
  //   await loginPromise;
  //
  //   const cookiesMock = await cookies();
  //   console.log("Cookies Mock:", cookiesMock); // Log to see the structure
  //
  //   const setMock = cookiesMock.set as jest.Mock;
  //   const setCalls = setMock.mock.calls;
  //
  //   expect(setCalls.length).toBe(2);
  //
  //   const [accessTokenName, accessTokenValue, accessTokenOptions] = setCalls[0];
  //   expect(accessTokenName).toBe(apiResponse.accessToken.name);
  //   expect(accessTokenValue).toBe(apiResponse.accessToken.value);
  //   expect(accessTokenOptions).toMatchObject({
  //     secure: true,
  //     httpOnly: true,
  //     expires: apiResponse.accessToken.expires,
  //   });
  //
  //   const [refreshTokenName, refreshTokenValue, refreshTokenOptions] =
  //     setCalls[1];
  //   expect(refreshTokenName).toBe(apiResponse.refreshToken.name);
  //   expect(refreshTokenValue).toBe(apiResponse.refreshToken.value);
  //   expect(refreshTokenOptions).toMatchObject({
  //     secure: true,
  //     httpOnly: true,
  //     expires: apiResponse.refreshToken.expires,
  //   });
  // });

  it("should redirect to main app URL when login is successful", async () => {
    const loginPromise = loginUser(formData);

    jest.runAllTimers();

    await loginPromise;

    expect(redirect).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_MAIN_APP_URL}`,
    );
  });

  it("should throw an error when credentials are invalid", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false });

    const loginPromise = loginUser(formData);

    jest.runAllTimers();

    await expect(loginPromise).rejects.toThrow("Credentials are invalid");
  });

  it("should log an error and throw an error for unexpected errors", async () => {
    const errorMessage = "Unexpected error";
    global.fetch = jest.fn().mockRejectedValueOnce(new Error(errorMessage));

    const loginPromise = loginUser(formData);

    jest.runAllTimers();

    await expect(loginPromise).rejects.toThrow(errorMessage);
    expect(console.error).toHaveBeenCalledWith(new Error(errorMessage));
  });
});

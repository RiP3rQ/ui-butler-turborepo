import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRegisterForm } from "@/hooks/use-register-form";
import registerUser from "~/src/actions/register-user";
import { getErrorMessage } from "@/lib/get-error-message";

// Mock modules
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

jest.mock("@/actions/registerUser", () => jest.fn());
jest.mock("@/lib/get-error-message", () => ({
  getErrorMessage: jest.fn(),
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useRegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should initialize form with default values", () => {
    const { result } = renderHook(() => useRegisterForm(), { wrapper });

    expect(result.current.form.getValues()).toEqual({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  });

  it("should call registerUser on submit with correct values", async () => {
    const { result } = renderHook(() => useRegisterForm(), { wrapper });
    const values = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    await act(async () => {
      await result.current.onSubmit(values);
    });

    expect(toast.loading).toHaveBeenCalledWith("Registering...", {
      id: "register",
    });
    expect(registerUser).toHaveBeenCalledWith(values);
  });

  it("should show success toast on successful registration", async () => {
    (registerUser as jest.Mock).mockResolvedValueOnce({});
    const { result } = renderHook(() => useRegisterForm(), { wrapper });
    const values = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    await act(async () => {
      await result.current.onSubmit(values);
    });

    expect(toast.success).toHaveBeenCalledWith("Registration successful!", {
      id: "register",
    });
    expect(result.current.form.getValues()).toEqual({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    }); // Ensure form reset
  });

  it("should show error toast on registration failure", async () => {
    const errorMessage = "Registration failed";
    (registerUser as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    (getErrorMessage as jest.Mock).mockReturnValue(errorMessage);
    const { result } = renderHook(() => useRegisterForm(), { wrapper });
    const values = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    await act(async () => {
      await result.current.onSubmit(values);
    });

    expect(console.error).toHaveBeenCalledWith(new Error(errorMessage));
    expect(toast.error).toHaveBeenCalledWith(errorMessage, {
      id: "register",
    });
  });

  it("should block submit button if form is invalid", () => {
    const { result } = renderHook(() => useRegisterForm(), { wrapper });

    // Initial state should block since default values are empty
    expect(result.current.isSubmitButtonBlocked).toBe(true);

    // Simulate valid form state
    act(() => {
      result.current.form.setValue("username", "testuser");
      result.current.form.setValue("email", "test@example.com");
      result.current.form.setValue("password", "password123");
      result.current.form.setValue("confirmPassword", "password123");
    });

    expect(result.current.isSubmitButtonBlocked).toBe(false);
  });

  it("should block submit button if passwords do not match", () => {
    const { result } = renderHook(() => useRegisterForm(), { wrapper });

    // Simulate form state with non-matching passwords
    act(() => {
      result.current.form.setValue("username", "testuser");
      result.current.form.setValue("email", "test@example.com");
      result.current.form.setValue("password", "password123");
      result.current.form.setValue("confirmPassword", "password321");
    });

    expect(result.current.isSubmitButtonBlocked).toBe(true);
  });

  it("should handle getErrorMessage correctly when onError is called", async () => {
    const errorObject = { error: "Server error" };
    (registerUser as jest.Mock).mockRejectedValueOnce(errorObject);
    (getErrorMessage as jest.Mock).mockReturnValue("Server error");
    const { result } = renderHook(() => useRegisterForm(), { wrapper });

    const values = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    await act(async () => {
      await result.current.onSubmit(values);
    });

    expect(getErrorMessage).toHaveBeenCalledWith(errorObject);
    expect(toast.error).toHaveBeenCalledWith("Server error", {
      id: "register",
    });
  });
});

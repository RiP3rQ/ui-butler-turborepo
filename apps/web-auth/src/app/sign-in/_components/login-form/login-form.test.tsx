import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLoginForm } from "@/hooks/use-login-form";
import { LoginForm } from "@/app/sign-in/_components/login-form/login-form";

// Mock dependencies
jest.mock("@/hooks/use-login-form");
jest.mock("sonner");
jest.mock("@/app/sign-in/_components/login-form/login-form-fields", () => ({
  LoginFormFields: ({ isDisabled }: { isDisabled: boolean }) => (
    <div data-testid="login-form-fields" aria-disabled={isDisabled}>
      <input type="email" data-testid="email-input" disabled={isDisabled} />
      <input
        type="password"
        data-testid="password-input"
        disabled={isDisabled}
      />
    </div>
  ),
}));

jest.mock(
  "@/app/sign-in/_components/social-platform-buttons/social-buttons",
  () => ({
    SocialLoginButtons: ({ isDisabled }: { isDisabled: boolean }) => (
      <div data-testid="social-buttons" aria-disabled={isDisabled} />
    ),
  }),
);

// LoginForm.test.tsx
describe("LoginForm", () => {
  const mockHandleSubmit = jest.fn();
  const mockForm = {
    handleSubmit: jest.fn((cb) => async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await cb({ email: "test@example.com", password: "password123" });
      } catch (error) {
        // Handle error in form submission
        console.error(error);
      }
    }),
    control: { register: jest.fn() },
    formState: { isSubmitting: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLoginForm as jest.Mock).mockReturnValue({
      form: mockForm,
      isPending: false,
      handleSubmit: mockHandleSubmit,
      isSubmitDisabled: false,
    });
  });

  it("renders form with all necessary elements", () => {
    render(<LoginForm />);
    expect(screen.getByTestId("login-form-fields")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
    expect(screen.getByTestId("social-buttons")).toBeInTheDocument();
  });

  it("submits form with correct data", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("disables form elements during submission", () => {
    (useLoginForm as jest.Mock).mockReturnValue({
      form: { ...mockForm, formState: { isSubmitting: true } },
      isPending: true,
      handleSubmit: mockHandleSubmit,
      isSubmitDisabled: false,
    });

    render(<LoginForm />);

    // Check button disabled state
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();

    // Check form fields disabled state
    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    // Check social buttons disabled state
    expect(screen.getByTestId("social-buttons")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("applies custom className", () => {
    render(<LoginForm className="test-class" />);
    expect(screen.getByTestId("form-wrapper")).toHaveClass(
      "test-class",
      "grid",
      "gap-4",
    );
  });

  it("disables submit button when form is invalid", () => {
    (useLoginForm as jest.Mock).mockReturnValue({
      form: mockForm,
      isPending: false,
      handleSubmit: mockHandleSubmit,
      isSubmitDisabled: true,
    });

    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
  });

  it("handles failed submission gracefully", async () => {
    const user = userEvent.setup();

    // Mock the handleSubmit to reject
    mockHandleSubmit.mockImplementationOnce(() =>
      Promise.reject(new Error("Failed")),
    );

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(mockHandleSubmit).toHaveBeenCalled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("maintains proper tab order", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.tab();
      expect(screen.getByTestId("email-input")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("password-input")).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("button", { name: /sign in/i })).toHaveFocus();
    });

    it("submits form with keyboard", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.tab(); // to email
      await user.tab(); // to password
      await user.tab(); // to submit button
      await user.keyboard("{Enter}");

      expect(mockHandleSubmit).toHaveBeenCalled();
    });
  });

  describe("form states", () => {
    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<LoginForm />);

      await user.click(screen.getByRole("button", { name: /sign in/i }));

      (useLoginForm as jest.Mock).mockReturnValue({
        form: { ...mockForm, formState: { isSubmitting: true } },
        isPending: true,
        handleSubmit: mockHandleSubmit,
        isSubmitDisabled: false,
      });

      rerender(<LoginForm />);

      expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
      expect(screen.getByTestId("email-input")).toBeDisabled();
      expect(screen.getByTestId("password-input")).toBeDisabled();
      expect(screen.getByTestId("social-buttons")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("handles error state correctly", () => {
      (useLoginForm as jest.Mock).mockReturnValue({
        form: {
          ...mockForm,
          formState: {
            isSubmitting: false,
            errors: { email: { message: "Invalid email" } },
          },
        },
        isPending: false,
        handleSubmit: mockHandleSubmit,
        isSubmitDisabled: true,
      });

      render(<LoginForm />);
      expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
    });
  });

  describe("component integration", () => {
    it("passes correct props to LoginFormFields", () => {
      render(<LoginForm />);

      // Only check if the component is rendered
      const formFields = screen.getByTestId("login-form-fields");
      expect(formFields).toBeInTheDocument();

      // Check if form is enabled by verifying inputs are not disabled
      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    it("passes correct disabled state to SocialLoginButtons", () => {
      render(<LoginForm />);
      expect(screen.getByTestId("social-buttons")).toHaveAttribute(
        "aria-disabled",
        "false",
      );
    });

    it("updates all components when form is submitting", () => {
      (useLoginForm as jest.Mock).mockReturnValue({
        form: { ...mockForm, formState: { isSubmitting: true } },
        isPending: true,
        handleSubmit: mockHandleSubmit,
        isSubmitDisabled: false,
      });

      render(<LoginForm />);

      const emailInput = screen.getByTestId("email-input");
      const passwordInput = screen.getByTestId("password-input");
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
      expect(screen.getByTestId("social-buttons")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });
  });
});

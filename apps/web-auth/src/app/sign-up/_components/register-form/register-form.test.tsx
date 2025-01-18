// RegisterForm.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRegisterForm } from "@/hooks/use-register-form";
import { RegisterForm } from "@/app/sign-up/_components/register-form/register-form";

// Mock dependencies
jest.mock("@/hooks/use-register-form");
jest.mock("@/components/ui/form", () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@repo/ui/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    className,
    type = "submit",
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    type?: "submit" | "button" | "reset";
  }) => (
    <button
      type={type}
      disabled={disabled}
      className={className ?? ""}
      data-testid="submit-button"
    >
      {children}
    </button>
  ),
}));

jest.mock(
  "@/app/sign-up/_components/register-form/register-form-fields",
  () => ({
    RegisterFormFields: ({ isDisabled }: { isDisabled: boolean }) => (
      <div data-testid="register-form-fields" aria-disabled={isDisabled}>
        Form Fields
      </div>
    ),
  }),
);

jest.mock(
  "@/app/sign-in/_components/social-platform-buttons/social-buttons",
  () => ({
    SocialLoginButtons: ({ isDisabled }: { isDisabled: boolean }) => (
      <div data-testid="social-buttons" aria-disabled={isDisabled}>
        Social Buttons
      </div>
    ),
  }),
);

describe("RegisterForm", () => {
  const mockOnSubmit = jest.fn();
  const mockForm = {
    handleSubmit: jest.fn((cb) => (e: React.FormEvent) => {
      e.preventDefault();
      return cb({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
    }),
    control: { register: jest.fn() },
    formState: { isSubmitting: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRegisterForm as jest.Mock).mockReturnValue({
      form: mockForm,
      isPending: false,
      onSubmit: mockOnSubmit,
      isSubmitButtonBlocked: false,
    });
  });

  describe("rendering", () => {
    it("renders all form components", () => {
      render(<RegisterForm />);

      expect(screen.getByTestId("register-form-fields")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
      expect(screen.getByText(/or continue with/i)).toBeInTheDocument();
      expect(screen.getByTestId("social-buttons")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(<RegisterForm className="test-class" />);
      expect(container.firstChild).toHaveClass("grid", "gap-4", "test-class");
    });
  });

  describe("form behavior", () => {
    it("handles form submission", async () => {
      const user = userEvent.setup();
      render(<RegisterForm />);

      await user.click(screen.getByTestId("submit-button"));
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it("prevents submission when form is disabled", async () => {
      const user = userEvent.setup();
      (useRegisterForm as jest.Mock).mockReturnValue({
        form: mockForm,
        isPending: true,
        onSubmit: mockOnSubmit,
        isSubmitButtonBlocked: false,
      });

      render(<RegisterForm />);
      await user.click(screen.getByTestId("submit-button"));
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("handles failed submission gracefully", async () => {
      // Setup
      const user = userEvent.setup();
      const mockError = new Error("Submission failed");

      // Create a mock function that will be called during form submission
      const mockHandleSubmit = jest.fn((cb) => async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          await cb({
            username: "testuser",
            email: "test@example.com",
            password: "password123",
            confirmPassword: "password123",
          });
        } catch (error: unknown) {
          // Silently catch the error as we expect it
        }
      });

      // Mock the form with our custom handleSubmit
      const mockFormWithError = {
        ...mockForm,
        handleSubmit: mockHandleSubmit,
      };

      // Mock the useRegisterForm hook with a failing submit
      (useRegisterForm as jest.Mock).mockReturnValue({
        form: mockFormWithError,
        isPending: false,
        onSubmit: jest.fn().mockImplementation(() => Promise.reject(mockError)),
        isSubmitButtonBlocked: false,
      });

      // Render and interact
      render(<RegisterForm />);
      const submitButton = screen.getByTestId("submit-button");

      // Act
      await user.click(submitButton);

      // Assert
      expect(mockHandleSubmit).toHaveBeenCalled();
      expect(submitButton).not.toHaveAttribute("disabled");
    });
  });

  describe("disabled states", () => {
    it("disables form when isPending is true", () => {
      (useRegisterForm as jest.Mock).mockReturnValue({
        form: mockForm,
        isPending: true,
        onSubmit: mockOnSubmit,
        isSubmitButtonBlocked: false,
      });

      render(<RegisterForm />);

      expect(screen.getByTestId("submit-button")).toHaveAttribute("disabled");
      expect(screen.getByTestId("register-form-fields")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      expect(screen.getByTestId("social-buttons")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("disables form when isSubmitting is true", () => {
      (useRegisterForm as jest.Mock).mockReturnValue({
        form: {
          ...mockForm,
          formState: { isSubmitting: true },
        },
        isPending: true,
        onSubmit: mockOnSubmit,
        isSubmitButtonBlocked: false,
      });

      render(<RegisterForm />);

      expect(screen.getByTestId("submit-button")).toHaveAttribute("disabled");
      expect(screen.getByTestId("register-form-fields")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("disables submit button when isSubmitButtonBlocked is true", () => {
      (useRegisterForm as jest.Mock).mockReturnValue({
        form: mockForm,
        isPending: false,
        onSubmit: mockOnSubmit,
        isSubmitButtonBlocked: true,
      });

      render(<RegisterForm />);
      expect(screen.getByTestId("submit-button")).toHaveAttribute("disabled");
    });
  });

  describe("accessibility", () => {
    it("maintains proper ARIA states when disabled", () => {
      (useRegisterForm as jest.Mock).mockReturnValue({
        form: mockForm,
        isPending: true,
        onSubmit: mockOnSubmit,
        isSubmitButtonBlocked: true,
      });

      render(<RegisterForm />);

      expect(screen.getByTestId("submit-button")).toHaveAttribute("disabled");
      expect(screen.getByTestId("register-form-fields")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      expect(screen.getByTestId("social-buttons")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });
  });

  describe("form state", () => {
    it("updates form state correctly", () => {
      const { rerender } = render(<RegisterForm />);

      // Initial state
      expect(screen.getByTestId("submit-button")).not.toHaveAttribute(
        "disabled",
      );

      // Update to disabled state
      (useRegisterForm as jest.Mock).mockReturnValue({
        form: mockForm,
        isPending: true,
        onSubmit: mockOnSubmit,
        isSubmitButtonBlocked: true,
      });

      rerender(<RegisterForm />);
      expect(screen.getByTestId("submit-button")).toHaveAttribute("disabled");
    });
  });
});

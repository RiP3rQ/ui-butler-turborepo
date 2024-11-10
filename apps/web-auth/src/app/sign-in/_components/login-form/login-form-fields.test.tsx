// LoginFormFields.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Control } from "react-hook-form";
import { z } from "zod";
import { loginFormSchema } from "@/schemas/login-schema";
import { LoginFormFields } from "@/app/sign-in/_components/login-form/login-form-fields.tsx";

// Define types
type LoginFormData = z.infer<typeof loginFormSchema>;

// Mock the UI components
jest.mock("@repo/ui/components/ui/form", () => ({
  FormField: ({ render, name }: any) =>
    render({
      field: {
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => e.target.value,
        value: "",
        name,
        onBlur: jest.fn(),
        ref: jest.fn(),
      },
    }),
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div className="form-item">{children}</div>
  ),
  FormLabel: ({
    htmlFor,
    children,
  }: {
    htmlFor: string;
    children: React.ReactNode;
  }) => <label htmlFor={htmlFor}>{children}</label>,
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div className="form-control">{children}</div>
  ),
  FormMessage: () => (
    <div data-testid="form-message" className="form-message" />
  ),
}));

jest.mock("@repo/ui/components/ui/input", () => ({
  Input: ({ id, type, onChange, value, ...props }: any) => (
    <input
      id={id}
      type={type || "text"}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e)}
      value={value}
      {...props}
    />
  ),
}));

jest.mock("@repo/ui/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

describe("LoginFormFields", () => {
  const mockControl = {
    register: jest.fn(),
    unregister: jest.fn(),
    getFieldState: jest.fn(),
    _formValues: {},
    _formState: {},
    _options: {},
  } as unknown as Control<LoginFormData>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields correctly", () => {
    render(<LoginFormFields control={mockControl} isDisabled={false} />);

    // Check for email field
    const emailInput = screen.getByTestId("email");
    const emailLabel = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailLabel).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("placeholder", "ui-butler@gmail.com");

    // Check for password field
    const passwordInput = screen.getByTestId("password");
    const passwordLabel = screen.getByLabelText(/password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordLabel).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("placeholder", "Super safe password");

    // Check for separator
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("sets correct input types", () => {
    render(<LoginFormFields control={mockControl} isDisabled={false} />);

    expect(screen.getByTestId("email")).toHaveAttribute("type", "text");
    expect(screen.getByTestId("password")).toHaveAttribute("type", "password");
  });

  it("applies disabled state correctly", () => {
    render(<LoginFormFields control={mockControl} isDisabled={true} />);

    expect(screen.getByTestId("email")).toBeDisabled();
    expect(screen.getByTestId("password")).toBeDisabled();
  });

  it("renders enabled fields when not disabled", () => {
    render(<LoginFormFields control={mockControl} isDisabled={false} />);

    expect(screen.getByTestId("email")).not.toBeDisabled();
    expect(screen.getByTestId("password")).not.toBeDisabled();
  });

  it("sets correct input types", () => {
    render(<LoginFormFields control={mockControl} isDisabled={false} />);

    expect(screen.getByTestId("email")).toHaveAttribute("type", undefined);
    expect(screen.getByTestId("password")).toHaveAttribute("type", "password");
  });

  describe("accessibility", () => {
    it("maintains proper tab order", async () => {
      const user = userEvent.setup();
      render(<LoginFormFields control={mockControl} isDisabled={false} />);

      const emailInput = screen.getByTestId("email");
      const passwordInput = screen.getByTestId("password");

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();
    });

    it("prevents tab navigation when disabled", async () => {
      const user = userEvent.setup();
      render(<LoginFormFields control={mockControl} isDisabled={true} />);

      const emailInput = screen.getByTestId("email");
      const passwordInput = screen.getByTestId("password");

      await user.tab();
      expect(emailInput).not.toHaveFocus();
      expect(passwordInput).not.toHaveFocus();
    });
  });

  describe("form control integration", () => {
    it("renders input fields correctly", () => {
      render(<LoginFormFields control={mockControl} isDisabled={false} />);

      expect(screen.getByTestId("email")).toBeInTheDocument();
      expect(screen.getByTestId("password")).toBeInTheDocument();
    });

    it("applies disabled state correctly", () => {
      render(<LoginFormFields control={mockControl} isDisabled={true} />);

      expect(screen.getByTestId("email")).toBeDisabled();
      expect(screen.getByTestId("password")).toBeDisabled();
    });

    it("prevents input when disabled", async () => {
      const user = userEvent.setup();
      render(<LoginFormFields control={mockControl} isDisabled={true} />);

      const emailInput = screen.getByTestId("email");
      const passwordInput = screen.getByTestId("password");

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      expect(emailInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
    });
  });

  describe("visual elements", () => {
    it("renders separator between fields", () => {
      render(<LoginFormFields control={mockControl} isDisabled={false} />);

      const separator = screen.getByTestId("separator");
      expect(separator).toBeInTheDocument();
      expect(separator.tagName.toLowerCase()).toBe("hr");
    });

    it("renders form messages", () => {
      render(<LoginFormFields control={mockControl} isDisabled={false} />);

      const formMessages = screen.getAllByTestId("form-message");
      expect(formMessages).toHaveLength(2);
    });
  });

  describe("form structure", () => {
    it("renders form items with correct structure", () => {
      const { container } = render(
        <LoginFormFields control={mockControl} isDisabled={false} />,
      );

      const formItems = container.getElementsByClassName("form-item");
      const formControls = container.getElementsByClassName("form-control");
      const formMessages = container.getElementsByClassName("form-message");

      expect(formItems.length).toBe(2); // One for email, one for password
      expect(formControls.length).toBe(2);
      expect(formMessages.length).toBe(2);
    });

    it("maintains correct nesting order", () => {
      const { container } = render(
        <LoginFormFields control={mockControl} isDisabled={false} />,
      );

      const formItems = container.getElementsByClassName("form-item");

      Array.from(formItems).forEach((item) => {
        // Check that each FormItem contains a label, FormControl, and FormMessage
        expect(item.querySelector("label")).toBeInTheDocument();
        expect(item.querySelector(".form-control")).toBeInTheDocument();
        expect(item.querySelector(".form-message")).toBeInTheDocument();
      });
    });
  });

  describe("input field attributes", () => {
    it("sets correct attributes for email field", () => {
      render(<LoginFormFields control={mockControl} isDisabled={false} />);

      const emailInput = screen.getByTestId("email");
      expect(emailInput).toHaveAttribute("id", "email");
      expect(emailInput).toHaveAttribute("placeholder", "ui-butler@gmail.com");
      expect(emailInput).toHaveAttribute("type", "text");
      expect(emailInput).not.toBeDisabled();
    });

    it("sets correct attributes for password field", () => {
      render(<LoginFormFields control={mockControl} isDisabled={false} />);

      const passwordInput = screen.getByTestId("password");
      expect(passwordInput).toHaveAttribute("id", "password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute(
        "placeholder",
        "Super safe password",
      );
      expect(passwordInput).not.toBeDisabled();
    });
  });

  describe("form control behavior", () => {
    it("passes form control props correctly", () => {
      const mockRegisterReturn = {
        name: "email" as const,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      };

      (mockControl.register as jest.Mock).mockReturnValue(mockRegisterReturn);

      render(<LoginFormFields control={mockControl} isDisabled={false} />);

      const emailInput = screen.getByTestId("email");
      expect(emailInput).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("displays form messages in correct position", () => {
      const { container } = render(
        <LoginFormFields control={mockControl} isDisabled={false} />,
      );

      const formItems = container.getElementsByClassName("form-item");

      Array.from(formItems).forEach((item) => {
        const children = Array.from(item.children);
        const lastChild = children[children.length - 1];
        expect(lastChild).toHaveClass("form-message");
      });
    });
  });

  describe("form field behavior", () => {
    it("renders inputs with correct attributes", () => {
      render(<LoginFormFields control={mockControl} isDisabled={false} />);

      const emailInput = screen.getByTestId("email");
      const passwordInput = screen.getByTestId("password");

      expect(emailInput).toHaveAttribute("placeholder", "ui-butler@gmail.com");
      expect(passwordInput).toHaveAttribute(
        "placeholder",
        "Super safe password",
      );
    });

    it("maintains form structure", () => {
      const { container } = render(
        <LoginFormFields control={mockControl} isDisabled={false} />,
      );

      // Check form items
      const formItems = container.getElementsByClassName("form-item");
      expect(formItems.length).toBe(2);

      // Check labels using getByLabelText
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Check form controls
      const formControls = container.getElementsByClassName("form-control");
      expect(formControls.length).toBe(2);

      // Check form messages
      const formMessages = screen.getAllByTestId("form-message");
      expect(formMessages).toHaveLength(2);
    });
  });
});

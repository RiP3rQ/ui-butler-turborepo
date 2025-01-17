// RegisterFormFields.test.tsx
import { render, screen } from "@testing-library/react";
import { type Control } from "react-hook-form";
import { type z } from "zod";
import { type registerFormSchema } from "@/schemas/register-schema";
import { RegisterFormFields } from "@/app/sign-up/_components/register-form/register-form-fields";

// Mock UI components
jest.mock("@repo/ui/components/ui/form", () => ({
  FormField: ({ render, disabled, name }: any) =>
    render({
      field: {
        onChange: jest.fn(),
        name,
        disabled,
      },
    }),
  FormItem: ({ children }: { children: React.ReactNode }) => (
    <div className="form-item">{children}</div>
  ),
  FormLabel: ({ children }: { children: React.ReactNode }) => (
    <label>{children}</label>
  ),
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div className="form-control">{children}</div>
  ),
  FormMessage: () => <div data-testid="form-message" />,
}));

jest.mock("@repo/ui/components/ui/input", () => ({
  Input: ({
    type,
    placeholder,
    disabled,
    name,
    ...props
  }: {
    type?: string;
    placeholder: string;
    disabled?: boolean;
    name?: string;
  }) => (
    <input
      type={type || "text"}
      placeholder={placeholder}
      disabled={disabled}
      name={name}
      data-testid={`input-${name || placeholder}`}
      {...props}
    />
  ),
}));

jest.mock("@repo/ui/components/ui/separator", () => ({
  Separator: () => <hr data-testid="separator" />,
}));

jest.mock("@/components/ui/form", () => ({
  FormDescription: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={className} data-testid="form-description">
      {children}
    </div>
  ),
}));

describe("RegisterFormFields", () => {
  const mockControl = {
    register: jest.fn(),
    unregister: jest.fn(),
    getFieldState: jest.fn(),
  } as unknown as Control<z.infer<typeof registerFormSchema>>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<RegisterFormFields control={mockControl} isDisabled={false} />);

    // Check labels
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByText("Confirm Password")).toBeInTheDocument();

    // Check inputs
    expect(screen.getByTestId("input-username")).toBeInTheDocument();
    expect(screen.getByTestId("input-email")).toBeInTheDocument();
    expect(screen.getByTestId("input-password")).toBeInTheDocument();
    expect(screen.getByTestId("input-confirmPassword")).toBeInTheDocument();
  });

  it("applies disabled state to all inputs", () => {
    render(<RegisterFormFields control={mockControl} isDisabled />);

    const inputs = [
      screen.getByTestId("input-username"),
      screen.getByTestId("input-email"),
      screen.getByTestId("input-password"),
      screen.getByTestId("input-confirmPassword"),
    ];

    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it("renders form descriptions", () => {
    render(<RegisterFormFields control={mockControl} isDisabled={false} />);

    const descriptions = screen.getAllByTestId("form-description");
    expect(descriptions).toHaveLength(2);
    expect(descriptions[0]).toHaveTextContent(
      "Type your username that will be displayed to other users.",
    );
    expect(descriptions[1]).toHaveTextContent(
      "Confirm your password by typing it again.",
    );
  });

  it("sets correct input types", () => {
    render(<RegisterFormFields control={mockControl} isDisabled={false} />);

    expect(screen.getByTestId("input-username")).toHaveAttribute(
      "type",
      "text",
    );
    expect(screen.getByTestId("input-email")).toHaveAttribute("type", "text");
    expect(screen.getByTestId("input-password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByTestId("input-confirmPassword")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("sets correct placeholders", () => {
    render(<RegisterFormFields control={mockControl} isDisabled={false} />);

    expect(screen.getByTestId("input-username")).toHaveAttribute(
      "placeholder",
      "SuperUser",
    );
    expect(screen.getByTestId("input-email")).toHaveAttribute(
      "placeholder",
      "ui-butler@gmail.com",
    );
    expect(screen.getByTestId("input-password")).toHaveAttribute(
      "placeholder",
      "Super safe password",
    );
    expect(screen.getByTestId("input-confirmPassword")).toHaveAttribute(
      "placeholder",
      "Super safe password",
    );
  });

  it("renders separator between email and password fields", () => {
    render(<RegisterFormFields control={mockControl} isDisabled={false} />);
    expect(screen.getByTestId("separator")).toBeInTheDocument();
  });

  it("renders form messages for all fields", () => {
    render(<RegisterFormFields control={mockControl} isDisabled={false} />);
    const formMessages = screen.getAllByTestId("form-message");
    expect(formMessages).toHaveLength(4); // One for each field
  });

  describe("form structure", () => {
    it("maintains correct form hierarchy", () => {
      render(<RegisterFormFields control={mockControl} isDisabled={false} />);

      const formItems = document.getElementsByClassName("form-item");
      const formControls = document.getElementsByClassName("form-control");

      expect(formItems.length).toBe(4); // One for each field
      expect(formControls.length).toBe(4); // One for each field
    });

    it("applies correct classes to descriptions", () => {
      render(<RegisterFormFields control={mockControl} isDisabled={false} />);

      const descriptions = screen.getAllByTestId("form-description");
      descriptions.forEach((description) => {
        expect(description).toHaveClass("text-xs");
      });
    });
  });

  describe("accessibility", () => {
    it("associates labels with inputs", () => {
      const { container } = render(
        <RegisterFormFields control={mockControl} isDisabled={false} />,
      );

      const formItems = container.getElementsByClassName("form-item");
      Array.from(formItems).forEach((item) => {
        const label = item.querySelector("label");
        const input = item.querySelector("input");
        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
      });
    });

    it("maintains disabled state consistency", () => {
      render(<RegisterFormFields control={mockControl} isDisabled />);

      const inputs = [
        screen.getByTestId("input-username"),
        screen.getByTestId("input-email"),
        screen.getByTestId("input-password"),
        screen.getByTestId("input-confirmPassword"),
      ];

      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });
});

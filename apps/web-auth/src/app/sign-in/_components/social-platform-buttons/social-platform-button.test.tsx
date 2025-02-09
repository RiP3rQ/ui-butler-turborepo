import { fireEvent, render, screen } from "@testing-library/react";
import { type LucideIcon, Mail } from "lucide-react";
import SocialPlatformButton from "@/app/sign-in/_components/social-platform-buttons/social-platform-button";

// Define the props type
interface SocialPlatformButtonProps {
  title: string;
  icon: LucideIcon;
  isLoading: boolean;
  onClick: () => void;
}

describe("SocialPlatformButton", () => {
  const defaultProps: SocialPlatformButtonProps = {
    title: "Email Login",
    icon: Mail,
    isLoading: false,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders button with correct title and icon", () => {
    render(<SocialPlatformButton {...defaultProps} />);

    const button = screen.getByRole("button", { name: /email login/i });
    expect(button).toBeInTheDocument();

    // Check if icon is rendered
    const icon = button.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    render(<SocialPlatformButton {...defaultProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading spinner and disables button when isLoading is true", () => {
    render(<SocialPlatformButton {...defaultProps} isLoading />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    // Check if loader is rendered
    const loader = screen.getByTestId("loader");
    expect(loader).toBeInTheDocument();

    // Check if original icon is not rendered
    const icon = button.querySelector(`[data-testid="icon"]`);
    expect(icon).not.toBeInTheDocument();
  });

  it("applies correct styles to button", () => {
    render(<SocialPlatformButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("variant-outline");
  });

  it("maintains button state when not loading", () => {
    render(<SocialPlatformButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();

    // Check if loader is not rendered
    const loader = screen.queryByTestId("loader");
    expect(loader).not.toBeInTheDocument();
  });

  it("prevents click events when loading", () => {
    render(<SocialPlatformButton {...defaultProps} isLoading />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });
});

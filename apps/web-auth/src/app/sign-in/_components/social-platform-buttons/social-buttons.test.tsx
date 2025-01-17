// SocialLoginButtons.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type LucideIcon } from "lucide-react";
import { SocialLoginButtons } from "@/app/sign-in/_components/social-platform-buttons/social-buttons";

// Mock the SocialPlatformButton component
// Types for the mock component
interface MockSocialPlatformButtonProps {
  title: string;
  isLoading: boolean;
  onClick: () => void;
  icon?: LucideIcon; // Optional because we don't use it in the mock
}

jest.mock(
  "@/app/sign-in/_components/social-platform-buttons/social-platform-button",
  () => {
    return function MockSocialPlatformButton({
      title,
      isLoading,
      onClick,
    }: MockSocialPlatformButtonProps) {
      return (
        <button
          onClick={onClick}
          disabled={isLoading}
          data-testid={`social-button-${title.toLowerCase()}`}
          aria-label={`Sign in with ${title}`}
        >
          {title}
        </button>
      );
    };
  },
);

describe("SocialLoginButtons", () => {
  const originalWindow = window.location;
  const mockApiUrl = "http://test-api.com";

  beforeEach(() => {
    // Mock window.location
    delete (window as { location?: Location }).location;
    window.location = { href: "" } as Location;

    // Set up environment variable
    process.env.NEXT_PUBLIC_API_URL = mockApiUrl;
  });

  afterEach(() => {
    // Restore window.location
    window.location = originalWindow;

    // Clear environment variables
    process.env.NEXT_PUBLIC_API_URL = undefined;

    jest.clearAllMocks();
  });

  it("renders both Google and Github buttons", () => {
    render(<SocialLoginButtons isDisabled={false} />);

    expect(screen.getByTestId("social-button-google")).toBeInTheDocument();
    expect(screen.getByTestId("social-button-github")).toBeInTheDocument();
  });

  it("passes correct props to SocialPlatformButtons", () => {
    render(<SocialLoginButtons isDisabled />);

    const googleButton = screen.getByTestId("social-button-google");
    const githubButton = screen.getByTestId("social-button-github");

    expect(googleButton).toBeDisabled();
    expect(githubButton).toBeDisabled();
  });

  it("redirects to Google auth URL when Google button is clicked", () => {
    render(<SocialLoginButtons isDisabled={false} />);

    const googleButton = screen.getByTestId("social-button-google");
    fireEvent.click(googleButton);

    expect(window.location.href).toBe(`${mockApiUrl}/auth/google`);
  });

  it("redirects to Github auth URL when Github button is clicked", () => {
    render(<SocialLoginButtons isDisabled={false} />);

    const githubButton = screen.getByTestId("social-button-github");
    fireEvent.click(githubButton);

    expect(window.location.href).toBe(`${mockApiUrl}/auth/github`);
  });

  it("prevents navigation when buttons are disabled", () => {
    render(<SocialLoginButtons isDisabled />);

    const googleButton = screen.getByTestId("social-button-google");
    const githubButton = screen.getByTestId("social-button-github");

    fireEvent.click(googleButton);
    expect(window.location.href).toBe("");

    fireEvent.click(githubButton);
    expect(window.location.href).toBe("");
  });

  describe("accessibility", () => {
    it("maintains button functionality with keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons isDisabled={false} />);

      // Focus and activate Google button with keyboard
      await user.tab();
      await user.keyboard("{enter}");
      expect(window.location.href).toBe(`${mockApiUrl}/auth/google`);

      // Reset href for next test
      window.location.href = "";

      // Focus and activate Github button with keyboard
      await user.tab();
      await user.keyboard("{enter}");
      expect(window.location.href).toBe(`${mockApiUrl}/auth/github`);
    });

    it("provides appropriate aria-labels", () => {
      render(<SocialLoginButtons isDisabled={false} />);

      expect(screen.getByLabelText("Sign in with Google")).toBeInTheDocument();
      expect(screen.getByLabelText("Sign in with Github")).toBeInTheDocument();
    });

    it("maintains proper tab order", async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons isDisabled={false} />);

      await user.tab();
      expect(screen.getByTestId("social-button-google")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("social-button-github")).toHaveFocus();
    });
  });

  describe("error handling", () => {
    let originalConsoleError: typeof console.error;
    let mockConsoleError: jest.Mock;

    beforeEach(() => {
      // Store original console.error
      originalConsoleError = console.error;
      // Create new mock for each test
      mockConsoleError = jest.fn();
      // Replace console.error
      console.error = mockConsoleError;
    });

    afterEach(() => {
      // Restore original console.error
      console.error = originalConsoleError;
    });

    it("handles missing API URL gracefully with empty string as env", () => {
      // Save and clear the API URL
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      process.env.NEXT_PUBLIC_API_URL = "";

      render(<SocialLoginButtons isDisabled={false} />);

      const googleButton = screen.getByTestId("social-button-google");
      fireEvent.click(googleButton);

      expect(window.location.href).toBe("/auth/google");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "API URL is not defined. Please check your environment variables.",
      );

      // Restore env
      process.env.NEXT_PUBLIC_API_URL = originalEnv;
    });
  });

  describe("loading states", () => {
    it("shows correct loading state for all buttons", () => {
      render(<SocialLoginButtons isDisabled />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });
});

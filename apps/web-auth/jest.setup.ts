import "@testing-library/jest-dom";

// Extend expect matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

// Create a mock for console.error that still allows us to filter React warnings
const mockConsoleError = jest.fn((...args) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("React does not recognize the") &&
    args[0].includes("prop on a DOM element")
  ) {
    return;
  }
  // Actually log the error in tests
  console.log("[Console.error]:", ...args);
});

// Replace console.error with our mock
console.error = mockConsoleError;

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock window.location
Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
});

// Set up environment variables
process.env.NEXT_PUBLIC_API_URL = "http://test-api.com";
process.env.NEXT_PUBLIC_MAIN_APP_URL = "http://test-app.com/dashboard";
export {};

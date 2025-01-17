import { ZodError } from "zod";
import { registerFormSchema } from "@/schemas/register-schema";

describe("registerFormSchema", () => {
  it("should validate correct username, email, password, and confirmPassword", () => {
    const validData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    expect(() => registerFormSchema.parse(validData)).not.toThrow();
  });

  it("should throw error for invalid email format", () => {
    const invalidEmailData = {
      username: "testuser",
      email: "invalid-email",
      password: "password123",
      confirmPassword: "password123",
    };

    try {
      registerFormSchema.parse(invalidEmailData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["email"],
            message: "Please provide a valid email",
            code: "invalid_string",
            validation: "email",
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for missing fields", () => {
    const missingFieldsData = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    try {
      registerFormSchema.parse(missingFieldsData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["username"],
            message: "This field cannot be blank",
            code: "invalid_type",
            expected: "string",
            received: "undefined",
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for non-matching passwords", () => {
    const nonMatchingPasswordsData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password321",
    };

    try {
      registerFormSchema.parse(nonMatchingPasswordsData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["confirmPassword"],
            code: "custom",
            message: "Passwords do not match",
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for short username", () => {
    const shortUsernameData = {
      username: "",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    try {
      registerFormSchema.parse(shortUsernameData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["username"],
            message: "Value is too short",
            code: "too_small",
            minimum: 1,
            type: "string",
            inclusive: true,
            exact: false,
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for long username", () => {
    const longUsername = "a".repeat(51);
    const longUsernameData = {
      username: longUsername,
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    try {
      registerFormSchema.parse(longUsernameData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["username"],
            message: "Value is too long",
            code: "too_big",
            maximum: 50,
            type: "string",
            inclusive: true,
            exact: false,
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for short password", () => {
    const shortPasswordData = {
      username: "testuser",
      email: "test@example.com",
      password: "short",
      confirmPassword: "short",
    };

    try {
      registerFormSchema.parse(shortPasswordData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["password"],
            message: "Password is too short",
            code: "too_small",
            minimum: 6,
            type: "string",
            inclusive: true,
            exact: false, // Include this field as indicated in the error message
          },
          {
            path: ["confirmPassword"],
            message: "Password is too short",
            code: "too_small",
            minimum: 6,
            type: "string",
            inclusive: true,
            exact: false, // Include this field as indicated in the error message
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for long email", () => {
    const longEmail = `${"a".repeat(101)}@example.com`;
    const longEmailData = {
      username: "testuser",
      email: longEmail,
      password: "password123",
      confirmPassword: "password123",
    };

    try {
      registerFormSchema.parse(longEmailData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["email"],
            message: "Value is too long",
            code: "too_big",
            maximum: 100,
            type: "string",
            inclusive: true,
            exact: false,
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });
});

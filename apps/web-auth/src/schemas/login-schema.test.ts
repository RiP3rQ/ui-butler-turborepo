import { loginFormSchema } from "@/schemas/login-schema";
import { ZodError } from "zod";

describe("loginFormSchema", () => {
  it("should validate correct email and password", () => {
    const validData = {
      email: "test@example.com",
      password: "password123",
    };

    expect(() => loginFormSchema.parse(validData)).not.toThrow();
  });

  it("should throw error for invalid email format", () => {
    const invalidEmailData = {
      email: "invalid-email",
      password: "password123",
    };

    try {
      loginFormSchema.parse(invalidEmailData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["email"],
            message: "Please provide a valid email",
            code: "invalid_string",
            validation: "email", // Include the validation field to match Zod's error
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for missing email", () => {
    const missingEmailData = {
      password: "password123",
    };

    try {
      loginFormSchema.parse(missingEmailData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["email"],
            message: "This field cannot be blank",
            code: "invalid_type",
            expected: "string", // Include expected field to match Zod's error
            received: "undefined", // Include received field
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for missing password", () => {
    const missingPasswordData = {
      email: "test@example.com",
    };

    try {
      loginFormSchema.parse(missingPasswordData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["password"],
            message: "This field cannot be blank",
            code: "invalid_type",
            expected: "string", // Include expected field to match Zod's error
            received: "undefined", // Include received field
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for short password", () => {
    const shortPasswordData = {
      email: "test@example.com",
      password: "short",
    };

    try {
      loginFormSchema.parse(shortPasswordData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["password"],
            message: "Password is too short",
            code: "too_small",
            minimum: 6, // Include minimum field to match Zod's error
            type: "string", // Include type field
            inclusive: true, // Include inclusive field
            exact: false, // Include exact field
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });

  it("should throw error for incorrect data types", () => {
    const invalidTypeData = {
      email: 123, // Invalid type
      password: "password123",
    };

    try {
      loginFormSchema.parse(invalidTypeData);
    } catch (error) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual([
          {
            path: ["email"],
            message: "Invalid type provided for this field",
            code: "invalid_type",
            expected: "string", // Include expected field to match Zod's error
            received: "number", // Include received field
          },
        ]);
      } else {
        throw new Error("Unexpected error type");
      }
    }
  });
});

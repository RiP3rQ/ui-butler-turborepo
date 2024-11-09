import { z } from "zod";

const invalid_type_error = "Invalid type provided for this field";
const required_error = "This field cannot be blank";

export const registerFormSchema = z
  .object({
    username: z
      .string({ invalid_type_error, required_error })
      .min(1, "Value is too short")
      .max(50, "Value is too long"),
    email: z
      .string({ invalid_type_error, required_error })
      .email("Please provide a valid email")
      .min(1, "Value is too short")
      .max(100, "Value is too long"),
    password: z
      .string({ invalid_type_error, required_error })
      .min(6, "Password is too short")
      .max(100, "Password is too long"),
    confirmPassword: z
      .string({ invalid_type_error, required_error })
      .min(6, "Password is too short")
      .max(100, "Password is too long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // path of error
  });

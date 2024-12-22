// libs/proto/src/auth/v1/index.ts
import { Transport } from "@nestjs/microservices";
import { join } from "path";
import {
  AUTH_SERVICE_NAME,
  AUTH_V1_PACKAGE_NAME,
  AuthResponse,
  AuthServiceClient,
} from "../../../types/auth/v1/auth";

export * from "../../../types/auth/v1/auth";

export interface AuthResponseWithDates
  extends Omit<AuthResponse, "expiresAccessToken" | "expiresRefreshToken"> {
  expiresAccessToken: Date;
  expiresRefreshToken: Date;
}

// Type guards and utilities
export const isAuthResponse = (obj: unknown): obj is AuthResponse => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "accessToken" in obj &&
    "refreshToken" in obj &&
    "expiresAccessToken" in obj &&
    "expiresRefreshToken" in obj &&
    typeof (obj as AuthResponse).accessToken === "string" &&
    typeof (obj as AuthResponse).refreshToken === "string" &&
    typeof (obj as AuthResponse).expiresAccessToken === "string" &&
    typeof (obj as AuthResponse).expiresRefreshToken === "string"
  );
};

export const isAuthResponseWithDates = (
  obj: unknown,
): obj is AuthResponseWithDates => {
  if (!isAuthResponse(obj)) return false;

  const candidate = obj as {
    expiresAccessToken: unknown;
    expiresRefreshToken: unknown;
  };
  return (
    candidate.expiresAccessToken instanceof Date &&
    candidate.expiresRefreshToken instanceof Date
  );
};

// Configuration
export const authGrpcOptions = {
  package: AUTH_V1_PACKAGE_NAME,
  protoPath: join(__dirname, "../../../types/auth/v1/auth.proto"),
  url: process.env.AUTH_SERVICE_URL || "localhost:5000",
} as const;

// Helper types
export type AuthServiceMethods = keyof AuthServiceClient;

// Helper function to create client options
export const createAuthClientOptions = (url: string) => ({
  transport: Transport.GRPC,
  options: {
    package: AUTH_V1_PACKAGE_NAME,
    protoPath: join(__dirname, "../../../types/auth/v1/auth.proto"),
    url,
  },
});

// Re-export important constants
export { AUTH_SERVICE_NAME };

// Helper function to convert dates in AuthResponse
export const formatAuthResponse = (
  response: AuthResponseWithDates,
): AuthResponse => ({
  ...response,
  expiresAccessToken: response.expiresAccessToken.toISOString(),
  expiresRefreshToken: response.expiresRefreshToken.toISOString(),
});

// Helper function to parse dates in AuthResponse
export const parseAuthResponse = (
  response: AuthResponse,
): AuthResponseWithDates => ({
  ...response,
  expiresAccessToken: new Date(response.expiresAccessToken),
  expiresRefreshToken: new Date(response.expiresRefreshToken),
});

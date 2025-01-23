import type { ProtoTimestamp } from "../others/proto-timestamp";

/**
 * Auth API endpoint types
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    username: string;
    createdAt: ProtoTimestamp;
    updatedAt: ProtoTimestamp;
  };
  redirect?: boolean;
  redirectUrl?: string;
}

export interface AuthEndpoints {
  /** POST /auth/register */
  register: {
    body: {
      email: string;
      password: string;
      username?: string;
    };
    response: AuthResponse;
  };

  /** POST /auth/login */
  login: {
    body: {
      email: string;
      password: string;
    };
    response: AuthResponse;
  };

  /** POST /auth/refresh */
  refresh: {
    body: {
      refreshToken: string;
      email: string;
    };
    response: AuthResponse;
  };

  /** GET /auth/google */
  googleAuth: {
    response: never;
  };

  /** GET /auth/google/callback */
  googleCallback: {
    response: AuthResponse;
  };

  /** GET /auth/github */
  githubAuth: {
    response: never;
  };

  /** GET /auth/github/callback */
  githubCallback: {
    response: AuthResponse;
  };
}

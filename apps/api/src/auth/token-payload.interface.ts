export interface TokenPayload {
  userId: string;
  email: string;
}

export interface ReceivedRefreshToken {
  refreshToken: string;
}

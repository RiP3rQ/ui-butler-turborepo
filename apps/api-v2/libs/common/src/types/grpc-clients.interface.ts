import { type AuthProto, type UsersProto } from "@microservices/proto";
import { type Observable } from "rxjs";

export interface AuthServiceClient {
  register: (
    request: AuthProto.RegisterRequest,
  ) => Observable<AuthProto.AuthResponse>;
  login: (
    request: AuthProto.LoginRequest,
  ) => Observable<AuthProto.AuthResponse>;
  refreshToken: (
    request: AuthProto.RefreshTokenRequest,
  ) => Observable<AuthProto.AuthResponse>;

  googleCallback: (
    request: AuthProto.SocialCallbackRequest,
  ) => Observable<AuthProto.AuthResponse>;

  githubCallback: (
    request: AuthProto.SocialCallbackRequest,
  ) => Observable<AuthProto.AuthResponse>;

  verifyRefreshToken: (
    request: AuthProto.VerifyRefreshTokenRequest,
  ) => Observable<AuthProto.User>;

  verifyUser: ((
    request: AuthProto.VerifyUserRequest,
  ) => Observable<AuthProto.User>) &
    ((request: AuthProto.VerifyUserRequest) => Promise<AuthProto.User>);
}

export interface UsersServiceClient {
  getUsers: (
    request: UsersProto.Empty,
  ) => Observable<UsersProto.GetUsersResponse>;

  getCurrentUser: (
    request: UsersProto.GetCurrentUserRequest,
  ) => Observable<UsersProto.GetCurrentUserResponse>;

  createProfile: (
    request: UsersProto.CreateProfileDto,
  ) => Observable<UsersProto.Profile>;

  createUser: (
    request: UsersProto.CreateUserDto,
  ) => Observable<UsersProto.User>;

  getOrCreateUser: (
    request: UsersProto.CreateUserDto,
  ) => Observable<UsersProto.User>;

  getUserByEmail: (
    request: UsersProto.GetUserByEmailRequest,
  ) => Observable<UsersProto.User>;

  updateUser: (
    request: UsersProto.UpdateUserRequest,
  ) => Observable<UsersProto.User>;
}

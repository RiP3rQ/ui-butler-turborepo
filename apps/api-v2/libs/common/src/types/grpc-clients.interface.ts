import { AuthProto, UsersProto } from "@app/proto";
import { Observable } from "rxjs";

export interface AuthServiceClient {
  verifyUser(request: AuthProto.VerifyUserRequest): Observable<AuthProto.User>;

  verifyRefreshToken(
    request: AuthProto.VerifyRefreshTokenRequest,
  ): Observable<AuthProto.User>;

  login(request: AuthProto.LoginRequest): Observable<AuthProto.AuthResponse>;

  refreshToken(
    request: AuthProto.RefreshTokenRequest,
  ): Observable<AuthProto.AuthResponse>;
}

export interface UsersServiceClient {
  getUsers(request: UsersProto.Empty): Observable<UsersProto.GetUsersResponse>;

  getCurrentUser(
    request: UsersProto.GetCurrentUserRequest,
  ): Observable<UsersProto.GetCurrentUserResponse>;

  createProfile(
    request: UsersProto.CreateProfileDto,
  ): Observable<UsersProto.Profile>;

  createUser(request: UsersProto.CreateUserDto): Observable<UsersProto.User>;

  getOrCreateUser(
    request: UsersProto.CreateUserDto,
  ): Observable<UsersProto.User>;

  getUserByEmail(
    request: UsersProto.GetUserByEmailRequest,
  ): Observable<UsersProto.User>;

  updateUser(
    request: UsersProto.UpdateUserRequest,
  ): Observable<UsersProto.User>;
}

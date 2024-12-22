// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.6.0
//   protoc               v3.20.3
// source: v1/users.proto

/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import {
  CreateProfileDto,
  CreateUserDto,
  Profile,
  TokenPayload,
  User,
} from "./common";

export const protobufPackage = "api.v1";

export interface Empty {}

export interface GetUsersResponse {
  users: User[];
}

export interface GetCurrentUserRequest {
  user?: User | undefined;
}

export interface GetCurrentUserResponse {
  id: number;
  username?: string | undefined;
  email: string;
  avatar?: string | undefined;
}

export interface GetUserByEmailRequest {
  email: string;
}

export interface UpdateUserRequest {
  query?: TokenPayload | undefined;
  data?: ReceivedRefreshToken | undefined;
}

export interface ReceivedRefreshToken {
  refreshToken: string;
}

export const API_V1_PACKAGE_NAME = "api.v1";

export interface UsersServiceClient {
  getUsers(request: Empty): Observable<GetUsersResponse>;

  getCurrentUser(
    request: GetCurrentUserRequest,
  ): Observable<GetCurrentUserResponse>;

  createProfile(request: CreateProfileDto): Observable<Profile>;

  createUser(request: CreateUserDto): Observable<User>;

  getOrCreateUser(request: CreateUserDto): Observable<User>;

  getUserByEmail(request: GetUserByEmailRequest): Observable<User>;

  updateUser(request: UpdateUserRequest): Observable<User>;
}

export interface UsersServiceController {
  getUsers(
    request: Empty,
  ):
    | Promise<GetUsersResponse>
    | Observable<GetUsersResponse>
    | GetUsersResponse;

  getCurrentUser(
    request: GetCurrentUserRequest,
  ):
    | Promise<GetCurrentUserResponse>
    | Observable<GetCurrentUserResponse>
    | GetCurrentUserResponse;

  createProfile(
    request: CreateProfileDto,
  ): Promise<Profile> | Observable<Profile> | Profile;

  createUser(request: CreateUserDto): Promise<User> | Observable<User> | User;

  getOrCreateUser(
    request: CreateUserDto,
  ): Promise<User> | Observable<User> | User;

  getUserByEmail(
    request: GetUserByEmailRequest,
  ): Promise<User> | Observable<User> | User;

  updateUser(
    request: UpdateUserRequest,
  ): Promise<User> | Observable<User> | User;
}

export function UsersServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "getUsers",
      "getCurrentUser",
      "createProfile",
      "createUser",
      "getOrCreateUser",
      "getUserByEmail",
      "updateUser",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod("UsersService", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod("UsersService", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const USERS_SERVICE_NAME = "UsersService";

"use server";

import {
  type User,
  type UsersEndpoints,
} from "@shared/types/src/api-client/users-endpoints";
import { UserService } from "@/actions/user/user-service";

/**
 * Fetches current user information
 */
export async function getCurrentUser(): Promise<User> {
  return UserService.getCurrentUser();
}

/**
 * Creates a new user profile
 */
export async function createUserProfile(
  request: Readonly<UsersEndpoints["createProfile"]["body"]>,
): Promise<UsersEndpoints["createProfile"]["response"]> {
  return UserService.createProfile(request);
}

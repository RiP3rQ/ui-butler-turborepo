"use server";

import type { BasicUser } from "@repo/types";
import { UserService } from "@/actions/user/user-service";

/**
 * Fetches current user information
 */
export default async function getCurrentUser(): Promise<BasicUser> {
  return UserService.getCurrentUser();
}

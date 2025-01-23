"use client";

import { getCurrentUser } from "@/actions/user/server-actions";
import { type User } from "@shared/types";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser(): {
  user: User | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  return { user: data, isLoading };
}

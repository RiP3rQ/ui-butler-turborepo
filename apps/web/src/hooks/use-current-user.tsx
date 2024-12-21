"use client";

import { type BasicUser } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "@/actions/user/server-actions";

export function useCurrentUser(): {
  user: BasicUser | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  return { user: data, isLoading };
}

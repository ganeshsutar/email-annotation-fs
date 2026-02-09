import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models";
import { mapUser } from "./user-mapper";

async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get("/auth/me/");
  return mapUser(response.data);
}

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: Infinity,
  });
}

export function useCurrentUser() {
  return useQuery(currentUserQueryOptions());
}

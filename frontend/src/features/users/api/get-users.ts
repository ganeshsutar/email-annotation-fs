import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models";
import { mapUser } from "@/features/auth/api/user-mapper";

export interface UsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
}

interface UsersResponse {
  count: number;
  results: User[];
}

async function getUsers(params: UsersParams): Promise<UsersResponse> {
  const response = await apiClient.get("/users/", {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      search: params.search || undefined,
      role: params.role || undefined,
      status: params.status || undefined,
    },
  });
  return {
    count: response.data.count,
    results: response.data.results.map(mapUser),
  };
}

export function useUsers(params: UsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  });
}

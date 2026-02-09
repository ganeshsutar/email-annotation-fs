import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models";
import { mapUser } from "./user-mapper";

async function changePassword(data: {
  new_password: string;
}): Promise<User> {
  const response = await apiClient.post("/auth/change-password/", data);
  return mapUser(response.data);
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changePassword,
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
    },
  });
}

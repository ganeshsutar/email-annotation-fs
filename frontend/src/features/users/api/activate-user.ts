import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models";
import { mapUser } from "@/features/auth/api/user-mapper";

async function activateUser(id: string): Promise<User> {
  const response = await apiClient.post(`/users/${id}/activate/`);
  return mapUser(response.data);
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User activated");
    },
  });
}

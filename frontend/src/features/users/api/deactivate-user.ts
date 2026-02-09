import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models";
import { mapUser } from "@/features/auth/api/user-mapper";

async function deactivateUser(id: string): Promise<User> {
  const response = await apiClient.post(`/users/${id}/deactivate/`);
  return mapUser(response.data);
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated");
    },
  });
}

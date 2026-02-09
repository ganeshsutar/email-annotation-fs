import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models";
import { mapUser } from "@/features/auth/api/user-mapper";

interface UpdateUserData {
  id: string;
  name?: string;
  role?: string;
}

async function updateUser({ id, ...data }: UpdateUserData): Promise<User> {
  const response = await apiClient.patch(`/users/${id}/`, data);
  return mapUser(response.data);
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
    },
  });
}

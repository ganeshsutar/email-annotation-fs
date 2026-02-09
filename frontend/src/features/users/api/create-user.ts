import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/types/models";
import { mapUser } from "@/features/auth/api/user-mapper";

interface CreateUserData {
  name: string;
  email: string;
  role: string;
}

interface CreateUserResponse extends User {
  tempPassword: string;
}

async function createUser(data: CreateUserData): Promise<CreateUserResponse> {
  const response = await apiClient.post("/users/", data);
  const user = mapUser(response.data);
  return {
    ...user,
    tempPassword: response.data.temp_password,
  };
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created");
    },
  });
}

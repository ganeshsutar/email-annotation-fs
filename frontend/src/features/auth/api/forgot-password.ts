import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

async function forgotPassword(data: { email: string }): Promise<void> {
  await apiClient.post("/auth/forgot-password/", data);
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

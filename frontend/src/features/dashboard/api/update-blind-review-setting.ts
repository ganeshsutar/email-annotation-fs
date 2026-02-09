import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface UpdateBlindReviewParams {
  enabled: boolean;
}

async function updateBlindReviewSetting(
  params: UpdateBlindReviewParams,
): Promise<{ enabled: boolean }> {
  const response = await apiClient.put("/settings/blind-review/", params);
  return response.data;
}

export function useUpdateBlindReviewSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBlindReviewSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "blind-review"] });
      toast.success("Setting updated");
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface BlindReviewSetting {
  enabled: boolean;
}

async function getBlindReviewSetting(): Promise<BlindReviewSetting> {
  const response = await apiClient.get("/settings/blind-review/");
  return response.data;
}

export function useBlindReviewSetting() {
  return useQuery({
    queryKey: ["settings", "blind-review"],
    queryFn: getBlindReviewSetting,
  });
}

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface BlindReviewResponse {
  enabled: boolean;
}

async function getBlindReviewSetting(): Promise<BlindReviewResponse> {
  const response = await apiClient.get("/qa/settings/blind-review/");
  return response.data;
}

export function useBlindReviewSetting() {
  return useQuery({
    queryKey: ["qa", "blind-review-setting"],
    queryFn: getBlindReviewSetting,
  });
}

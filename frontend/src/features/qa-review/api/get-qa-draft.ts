import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface QADraftResponse {
  data: Record<string, unknown>;
}

async function getQADraft(jobId: string): Promise<QADraftResponse> {
  const response = await apiClient.get(`/qa/jobs/${jobId}/draft/`);
  return response.data;
}

export function useQADraft(jobId: string) {
  return useQuery({
    queryKey: ["qa", "job", jobId, "draft"],
    queryFn: () => getQADraft(jobId),
    enabled: !!jobId,
  });
}

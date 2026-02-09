import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

async function getJobRawContent(jobId: string): Promise<string> {
  const response = await apiClient.get<string>(`/jobs/${jobId}/raw-content/`, {
    transformResponse: [(data) => data],
  });
  return response.data;
}

export function useJobRawContent(jobId: string | null) {
  return useQuery({
    queryKey: ["jobs", jobId, "raw-content"],
    queryFn: () => getJobRawContent(jobId!),
    enabled: !!jobId,
  });
}

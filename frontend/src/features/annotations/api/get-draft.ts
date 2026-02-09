import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { WorkspaceAnnotation } from "@/types/models";

interface DraftResponse {
  annotations: WorkspaceAnnotation[];
}

async function getDraft(jobId: string): Promise<DraftResponse> {
  const response = await apiClient.get(`/annotations/jobs/${jobId}/draft/`);
  return response.data;
}

export function useDraft(jobId: string) {
  return useQuery({
    queryKey: ["annotations", "job", jobId, "draft"],
    queryFn: () => getDraft(jobId),
    enabled: !!jobId,
  });
}

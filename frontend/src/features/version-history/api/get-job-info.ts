import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapJobInfo, type VersionHistoryJobInfo } from "./history-mapper";

async function getJobInfo(jobId: string): Promise<VersionHistoryJobInfo> {
  const response = await apiClient.get(`/history/jobs/${jobId}/info/`);
  return mapJobInfo(response.data);
}

export function useJobInfo(jobId: string) {
  return useQuery({
    queryKey: ["version-history", "job-info", jobId],
    queryFn: () => getJobInfo(jobId),
    enabled: !!jobId,
  });
}

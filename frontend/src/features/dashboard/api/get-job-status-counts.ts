import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface JobStatusCountsParams {
  datasetId?: string;
}

async function getJobStatusCounts(
  params: JobStatusCountsParams,
): Promise<Record<string, number>> {
  const response = await apiClient.get("/dashboard/job-status-counts/", {
    params: { dataset_id: params.datasetId || undefined },
  });
  return response.data;
}

export function useJobStatusCounts(params: JobStatusCountsParams = {}) {
  return useQuery({
    queryKey: ["dashboard", "job-status-counts", params.datasetId ?? "all"],
    queryFn: () => getJobStatusCounts(params),
  });
}

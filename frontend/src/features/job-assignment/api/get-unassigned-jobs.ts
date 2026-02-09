import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { JobWithDatasetName } from "@/features/datasets/api/job-mapper";
import { mapJobWithDatasetName } from "@/features/datasets/api/job-mapper";

export interface UnassignedJobsParams {
  type: "ANNOTATION" | "QA";
  page?: number;
  pageSize?: number;
  search?: string;
  datasetId?: string;
}

interface UnassignedJobsResponse {
  count: number;
  results: JobWithDatasetName[];
}

async function getUnassignedJobs(
  params: UnassignedJobsParams,
): Promise<UnassignedJobsResponse> {
  const response = await apiClient.get("/jobs/unassigned/", {
    params: {
      type: params.type,
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      search: params.search || undefined,
      dataset_id: params.datasetId || undefined,
    },
  });
  return {
    count: response.data.count,
    results: response.data.results.map(mapJobWithDatasetName),
  };
}

export function useUnassignedJobs(params: UnassignedJobsParams) {
  return useQuery({
    queryKey: ["jobs", "unassigned", params],
    queryFn: () => getUnassignedJobs(params),
    placeholderData: keepPreviousData,
  });
}

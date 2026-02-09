import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Job } from "@/types/models";
import { mapJob } from "./job-mapper";

export interface JobsByDatasetParams {
  datasetId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

interface JobsByDatasetResponse {
  count: number;
  results: Job[];
}

async function getJobsByDataset(
  params: JobsByDatasetParams,
): Promise<JobsByDatasetResponse> {
  const response = await apiClient.get(`/datasets/${params.datasetId}/jobs/`, {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      search: params.search || undefined,
      status: params.status || undefined,
    },
  });
  return {
    count: response.data.count,
    results: response.data.results.map(mapJob),
  };
}

export function useJobsByDataset(params: JobsByDatasetParams) {
  return useQuery({
    queryKey: ["datasets", params.datasetId, "jobs", params],
    queryFn: () => getJobsByDataset(params),
    placeholderData: keepPreviousData,
  });
}

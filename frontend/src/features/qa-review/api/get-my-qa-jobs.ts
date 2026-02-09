import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapMyQAJob, type MyQAJob } from "./qa-review-mapper";

export interface MyQAJobsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

interface MyQAJobsResponse {
  count: number;
  statusCounts: Record<string, number>;
  results: MyQAJob[];
}

async function getMyQAJobs(params: MyQAJobsParams): Promise<MyQAJobsResponse> {
  const response = await apiClient.get("/qa/my-jobs/", {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 20,
      status: params.status || undefined,
      search: params.search || undefined,
    },
  });
  return {
    count: response.data.count,
    statusCounts: (response.data.status_counts ?? {}) as Record<string, number>,
    results: (response.data.results as Record<string, unknown>[]).map(
      mapMyQAJob,
    ),
  };
}

export function useMyQAJobs(params: MyQAJobsParams) {
  return useQuery({
    queryKey: ["qa", "my-jobs", params],
    queryFn: () => getMyQAJobs(params),
    placeholderData: keepPreviousData,
  });
}

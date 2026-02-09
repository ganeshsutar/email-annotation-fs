import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapMyAnnotationJob, type MyAnnotationJob } from "./annotation-mapper";

export interface MyAnnotationJobsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
}

interface MyAnnotationJobsResponse {
  count: number;
  statusCounts: Record<string, number>;
  results: MyAnnotationJob[];
}

async function getMyAnnotationJobs(
  params: MyAnnotationJobsParams,
): Promise<MyAnnotationJobsResponse> {
  const response = await apiClient.get("/annotations/my-jobs/", {
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
      mapMyAnnotationJob,
    ),
  };
}

export function useMyAnnotationJobs(params: MyAnnotationJobsParams) {
  return useQuery({
    queryKey: ["annotations", "my-jobs", params],
    queryFn: () => getMyAnnotationJobs(params),
    placeholderData: keepPreviousData,
  });
}

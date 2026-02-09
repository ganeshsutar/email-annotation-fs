import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DatasetSummary } from "./dataset-mapper";
import { mapDatasetSummary } from "./dataset-mapper";

async function getDataset(id: string): Promise<DatasetSummary> {
  const response = await apiClient.get(`/datasets/${id}/`);
  return mapDatasetSummary(response.data);
}

export function datasetQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["datasets", id],
    queryFn: () => getDataset(id),
  });
}

export function useDataset(id: string) {
  return useQuery(datasetQueryOptions(id));
}

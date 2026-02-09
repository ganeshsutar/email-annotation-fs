import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapExportRecord, type ExportRecord } from "./export-mapper";

interface ExportHistoryParams {
  page?: number;
  datasetId?: string | null;
}

interface ExportHistoryResponse {
  count: number;
  results: ExportRecord[];
}

async function getExportHistory(
  params: ExportHistoryParams,
): Promise<ExportHistoryResponse> {
  const response = await apiClient.get("/exports/", {
    params: {
      page: params.page ?? 1,
      dataset_id: params.datasetId || undefined,
    },
  });
  return {
    count: response.data.count,
    results: (response.data.results as Record<string, unknown>[]).map(
      mapExportRecord,
    ),
  };
}

export function useExportHistory(params: ExportHistoryParams) {
  return useQuery({
    queryKey: ["exports", "history", params],
    queryFn: () => getExportHistory(params),
    placeholderData: keepPreviousData,
  });
}

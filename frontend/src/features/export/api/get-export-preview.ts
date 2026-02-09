import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapExportPreview, type ExportPreview } from "./export-mapper";

async function getExportPreview(jobId: string): Promise<ExportPreview> {
  const response = await apiClient.get(`/exports/preview/${jobId}/`);
  return mapExportPreview(response.data);
}

export function useExportPreview(jobId: string | null) {
  return useQuery({
    queryKey: ["exports", "preview", jobId],
    queryFn: () => getExportPreview(jobId!),
    enabled: !!jobId,
  });
}

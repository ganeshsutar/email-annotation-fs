import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapDatasetWithDelivered, type ExportDataset } from "./export-mapper";

async function getDatasetsWithDelivered(): Promise<ExportDataset[]> {
  const response = await apiClient.get("/exports/datasets/");
  return (response.data as Record<string, unknown>[]).map(
    mapDatasetWithDelivered,
  );
}

export function useExportDatasets() {
  return useQuery({
    queryKey: ["exports", "datasets"],
    queryFn: getDatasetsWithDelivered,
  });
}

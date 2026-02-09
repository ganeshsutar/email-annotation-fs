import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapRecentDataset, type RecentDataset } from "./dashboard-mapper";

async function getRecentDatasets(): Promise<RecentDataset[]> {
  const response = await apiClient.get("/dashboard/recent-datasets/");
  return (response.data as Record<string, unknown>[]).map(mapRecentDataset);
}

export function useRecentDatasets() {
  return useQuery({
    queryKey: ["dashboard", "recent-datasets"],
    queryFn: getRecentDatasets,
  });
}

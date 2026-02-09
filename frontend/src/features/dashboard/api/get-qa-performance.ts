import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapQAPerformance, type QAPerformance } from "./dashboard-mapper";

async function getQAPerformance(): Promise<QAPerformance[]> {
  const response = await apiClient.get("/dashboard/qa-performance/");
  return (response.data as Record<string, unknown>[]).map(mapQAPerformance);
}

export function useQAPerformance() {
  return useQuery({
    queryKey: ["dashboard", "qa-performance"],
    queryFn: getQAPerformance,
  });
}

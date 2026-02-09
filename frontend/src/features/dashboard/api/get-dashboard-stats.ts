import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapDashboardStats, type DashboardStats } from "./dashboard-mapper";

async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get("/dashboard/stats/");
  return mapDashboardStats(response.data);
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    staleTime: 0,
  });
}

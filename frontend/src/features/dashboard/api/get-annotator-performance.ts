import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  mapAnnotatorPerformance,
  type AnnotatorPerformance,
} from "./dashboard-mapper";

async function getAnnotatorPerformance(): Promise<AnnotatorPerformance[]> {
  const response = await apiClient.get("/dashboard/annotator-performance/");
  return (response.data as Record<string, unknown>[]).map(
    mapAnnotatorPerformance,
  );
}

export function useAnnotatorPerformance() {
  return useQuery({
    queryKey: ["dashboard", "annotator-performance"],
    queryFn: getAnnotatorPerformance,
  });
}

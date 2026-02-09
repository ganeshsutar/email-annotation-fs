import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface DatasetOption {
  id: string;
  name: string;
}

async function getDatasetOptions(): Promise<DatasetOption[]> {
  const response = await apiClient.get("/datasets/", {
    params: { page_size: 200 },
  });
  return response.data.results.map((d: Record<string, unknown>) => ({
    id: d.id as string,
    name: d.name as string,
  }));
}

export function useDatasetOptions() {
  return useQuery({
    queryKey: ["datasets", "options"],
    queryFn: getDatasetOptions,
    staleTime: 5 * 60 * 1000,
  });
}

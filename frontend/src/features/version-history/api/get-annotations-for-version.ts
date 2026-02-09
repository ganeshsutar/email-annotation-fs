import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { mapVersionAnnotation, type VersionAnnotation } from "./history-mapper";

async function getAnnotationsForVersion(
  versionId: string,
): Promise<VersionAnnotation[]> {
  const response = await apiClient.get(
    `/history/versions/${versionId}/annotations/`,
  );
  return (response.data as Record<string, unknown>[]).map(mapVersionAnnotation);
}

export function useAnnotationsForVersion(versionId: string | null) {
  return useQuery({
    queryKey: ["version-history", "annotations", versionId],
    queryFn: () => getAnnotationsForVersion(versionId!),
    enabled: !!versionId,
  });
}

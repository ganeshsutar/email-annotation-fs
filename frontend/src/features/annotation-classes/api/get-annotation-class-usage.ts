import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface AnnotationClassUsage {
  annotationClassId: string;
  annotationCount: number;
}

async function getAnnotationClassUsage(
  id: string,
): Promise<AnnotationClassUsage> {
  const response = await apiClient.get(`/annotation-classes/${id}/usage/`);
  return {
    annotationClassId: response.data.annotation_class_id,
    annotationCount: response.data.annotation_count,
  };
}

export function useAnnotationClassUsage(id: string | null) {
  return useQuery({
    queryKey: ["annotation-classes", id, "usage"],
    queryFn: () => getAnnotationClassUsage(id!),
    enabled: !!id,
  });
}

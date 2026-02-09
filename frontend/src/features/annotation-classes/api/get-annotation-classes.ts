import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AnnotationClass } from "@/types/models";
import { mapAnnotationClass } from "./annotation-class-mapper";

async function getAnnotationClasses(): Promise<AnnotationClass[]> {
  const response = await apiClient.get("/annotation-classes/");
  return (response.data as Record<string, unknown>[]).map(mapAnnotationClass);
}

export function useAnnotationClasses() {
  return useQuery({
    queryKey: ["annotation-classes"],
    queryFn: getAnnotationClasses,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { AnnotationClass } from "@/types/models";
import { mapAnnotationClass } from "./annotation-class-mapper";

interface CreateAnnotationClassData {
  name: string;
  display_label: string;
  color: string;
  description?: string;
}

async function createAnnotationClass(
  data: CreateAnnotationClassData,
): Promise<AnnotationClass> {
  const response = await apiClient.post("/annotation-classes/", data);
  return mapAnnotationClass(response.data);
}

export function useCreateAnnotationClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAnnotationClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotation-classes"] });
      toast.success("Annotation class created");
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { AnnotationClass } from "@/types/models";
import { mapAnnotationClass } from "./annotation-class-mapper";

interface UpdateAnnotationClassData {
  id: string;
  display_label?: string;
  color?: string;
  description?: string;
}

async function updateAnnotationClass({
  id,
  ...data
}: UpdateAnnotationClassData): Promise<AnnotationClass> {
  const response = await apiClient.patch(`/annotation-classes/${id}/`, data);
  return mapAnnotationClass(response.data);
}

export function useUpdateAnnotationClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAnnotationClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotation-classes"] });
      toast.success("Annotation class updated");
    },
  });
}

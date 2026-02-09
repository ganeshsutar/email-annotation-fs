import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

async function deleteAnnotationClass(id: string): Promise<void> {
  await apiClient.delete(`/annotation-classes/${id}/`);
}

export function useDeleteAnnotationClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnotationClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotation-classes"] });
      toast.success("Annotation class deleted");
    },
  });
}

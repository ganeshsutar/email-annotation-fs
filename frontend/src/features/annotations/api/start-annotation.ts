import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

async function startAnnotation(jobId: string): Promise<void> {
  await apiClient.post(`/annotations/jobs/${jobId}/start/`);
}

export function useStartAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startAnnotation,
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: ["annotations", "my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["annotations", "job", jobId] });
      toast.success("Annotation started");
    },
  });
}

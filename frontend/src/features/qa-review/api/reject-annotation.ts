import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface RejectAnnotationParams {
  jobId: string;
  comments: string;
  annotationNotes?: Record<string, string>;
}

async function rejectAnnotation({
  jobId,
  comments,
  annotationNotes,
}: RejectAnnotationParams): Promise<void> {
  await apiClient.post(`/qa/jobs/${jobId}/reject/`, {
    comments,
    annotation_notes: annotationNotes ?? {},
  });
}

export function useRejectAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qa", "my-jobs"] });
      toast.success("Annotations rejected");
    },
  });
}

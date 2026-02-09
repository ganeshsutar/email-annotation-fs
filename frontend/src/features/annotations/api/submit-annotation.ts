import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { WorkspaceAnnotation } from "@/types/models";
import { workspaceAnnotationToServer } from "./annotation-mapper";

interface SubmitAnnotationParams {
  jobId: string;
  annotations: WorkspaceAnnotation[];
}

async function submitAnnotation({
  jobId,
  annotations,
}: SubmitAnnotationParams): Promise<void> {
  await apiClient.post(`/annotations/jobs/${jobId}/submit/`, {
    annotations: annotations.map(workspaceAnnotationToServer),
  });
}

export function useSubmitAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotations", "my-jobs"] });
      toast.success("Annotations submitted");
    },
  });
}

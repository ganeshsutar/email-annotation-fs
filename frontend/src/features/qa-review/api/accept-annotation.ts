import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { WorkspaceAnnotation } from "@/types/models";
import { workspaceAnnotationToServer } from "./qa-review-mapper";

export interface QAModification {
  type: "modified" | "added" | "deleted";
  annotationId: string;
  description: string;
}

interface AcceptAnnotationParams {
  jobId: string;
  comments: string;
  modifications: QAModification[];
  modifiedAnnotations: WorkspaceAnnotation[] | null;
}

async function acceptAnnotation({
  jobId,
  comments,
  modifications,
  modifiedAnnotations,
}: AcceptAnnotationParams): Promise<void> {
  await apiClient.post(`/qa/jobs/${jobId}/accept/`, {
    comments,
    modifications,
    modified_annotations: modifiedAnnotations
      ? modifiedAnnotations.map(workspaceAnnotationToServer)
      : null,
  });
}

export function useAcceptAnnotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acceptAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qa", "my-jobs"] });
      toast.success("Annotations accepted");
    },
  });
}

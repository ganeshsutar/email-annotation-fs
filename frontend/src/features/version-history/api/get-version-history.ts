import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  mapAnnotationVersionSummary,
  mapQAReviewVersionSummary,
  type AnnotationVersionSummary,
  type QAReviewVersionSummary,
} from "./history-mapper";

interface VersionHistoryResponse {
  annotationVersions: AnnotationVersionSummary[];
  qaReviewVersions: QAReviewVersionSummary[];
}

async function getVersionHistory(
  jobId: string,
): Promise<VersionHistoryResponse> {
  const response = await apiClient.get(`/history/jobs/${jobId}/`);
  return {
    annotationVersions: (
      response.data.annotation_versions as Record<string, unknown>[]
    ).map(mapAnnotationVersionSummary),
    qaReviewVersions: (
      response.data.qa_review_versions as Record<string, unknown>[]
    ).map(mapQAReviewVersionSummary),
  };
}

export function useVersionHistory(jobId: string) {
  return useQuery({
    queryKey: ["version-history", jobId],
    queryFn: () => getVersionHistory(jobId),
    enabled: !!jobId,
  });
}

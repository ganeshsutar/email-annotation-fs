import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface JobImpact {
  userId: string;
  assignedAnnotatorJobs: number;
  assignedQaJobs: number;
  total: number;
}

async function getUserJobImpact(id: string): Promise<JobImpact> {
  const response = await apiClient.get(`/users/${id}/job_impact/`);
  return {
    userId: response.data.user_id,
    assignedAnnotatorJobs: response.data.assigned_annotator_jobs,
    assignedQaJobs: response.data.assigned_qa_jobs,
    total: response.data.total,
  };
}

export function useUserJobImpact(id: string | null) {
  return useQuery({
    queryKey: ["users", id, "job-impact"],
    queryFn: () => getUserJobImpact(id!),
    enabled: !!id,
  });
}

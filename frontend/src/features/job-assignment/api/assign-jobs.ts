import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface AssignJobsData {
  jobIds: string[];
  assigneeId: string;
  type: "ANNOTATION" | "QA";
}

interface AssignJobsResponse {
  updated: number;
}

async function assignJobs(data: AssignJobsData): Promise<AssignJobsResponse> {
  const response = await apiClient.post("/jobs/assign/", {
    job_ids: data.jobIds,
    assignee_id: data.assigneeId,
    type: data.type,
  });
  return { updated: response.data.updated };
}

export function useAssignJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      toast.success("Jobs assigned");
    },
  });
}

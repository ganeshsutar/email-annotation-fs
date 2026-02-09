import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface ReassignJobsData {
  jobIds: string[];
  newAssigneeId: string;
  type: "ANNOTATION" | "QA";
}

interface ReassignJobsResponse {
  updated: number;
}

async function reassignJobs(
  data: ReassignJobsData,
): Promise<ReassignJobsResponse> {
  const response = await apiClient.post("/jobs/reassign/", {
    job_ids: data.jobIds,
    new_assignee_id: data.newAssigneeId,
    type: data.type,
  });
  return { updated: response.data.updated };
}

export function useReassignJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reassignJobs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      toast.success("Jobs reassigned");
    },
  });
}

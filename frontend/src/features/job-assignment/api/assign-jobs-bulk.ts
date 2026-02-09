import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface BulkAssignment {
  jobId: string;
  assigneeId: string;
}

interface AssignJobsBulkData {
  assignments: BulkAssignment[];
  type: "ANNOTATION" | "QA";
}

interface AssignJobsBulkResponse {
  updated: number;
}

async function assignJobsBulk(
  data: AssignJobsBulkData,
): Promise<AssignJobsBulkResponse> {
  const response = await apiClient.post("/jobs/assign-bulk/", {
    assignments: data.assignments.map((a) => ({
      job_id: a.jobId,
      assignee_id: a.assigneeId,
    })),
    type: data.type,
  });
  return { updated: response.data.updated };
}

export function useAssignJobsBulk() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignJobsBulk,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      toast.success("Jobs assigned");
    },
  });
}

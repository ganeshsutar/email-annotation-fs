import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface UserWorkload {
  userId: string;
  assignedCount: number;
}

async function getUserWorkloads(
  type: "ANNOTATION" | "QA",
): Promise<UserWorkload[]> {
  const response = await apiClient.get("/jobs/workloads/", {
    params: { type },
  });
  return response.data.map(
    (w: { user_id: string; assigned_count: number }) => ({
      userId: w.user_id,
      assignedCount: w.assigned_count,
    }),
  );
}

export function useUserWorkloads(type: "ANNOTATION" | "QA") {
  return useQuery({
    queryKey: ["jobs", "workloads", type],
    queryFn: () => getUserWorkloads(type),
  });
}

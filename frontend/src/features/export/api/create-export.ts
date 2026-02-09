import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface CreateExportParams {
  jobIds: string[];
}

interface CreateExportResponse {
  id: string;
  downloadUrl: string;
}

async function createExport(
  params: CreateExportParams,
): Promise<CreateExportResponse> {
  const response = await apiClient.post("/exports/", {
    job_ids: params.jobIds,
  });
  return {
    id: response.data.id,
    downloadUrl: response.data.download_url,
  };
}

export function useCreateExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exports", "history"] });
      toast.success("Export created");
    },
  });
}

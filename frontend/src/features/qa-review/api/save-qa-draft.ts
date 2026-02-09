import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface SaveQADraftParams {
  jobId: string;
  data: Record<string, unknown>;
}

async function saveQADraft({ jobId, data }: SaveQADraftParams): Promise<void> {
  await apiClient.put(`/qa/jobs/${jobId}/draft/`, { data });
}

export function useSaveQADraft() {
  return useMutation({
    mutationFn: saveQADraft,
    onSuccess: () => {
      toast.success("QA draft saved");
    },
  });
}

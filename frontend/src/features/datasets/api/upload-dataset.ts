import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import type { DatasetSummary } from "./dataset-mapper";
import { mapDatasetSummary } from "./dataset-mapper";

interface UploadDatasetData {
  name: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
}

async function uploadDataset({
  name,
  file,
  onUploadProgress,
}: UploadDatasetData): Promise<DatasetSummary> {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("file", file);

  const response = await apiClient.post("/datasets/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onUploadProgress && event.total) {
        onUploadProgress(Math.round((event.loaded * 100) / event.total));
      }
    },
  });
  return mapDatasetSummary(response.data);
}

export function useUploadDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadDataset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
      toast.success("Dataset uploaded");
    },
  });
}

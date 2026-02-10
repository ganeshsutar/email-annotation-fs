import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteDataset } from "@/features/datasets/api/delete-dataset";

interface DatasetDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string | null;
  datasetName: string;
  fileCount: number;
  onComplete: () => void;
}

export function DatasetDeleteConfirmDialog({
  open,
  onOpenChange,
  datasetId,
  datasetName,
  fileCount,
  onComplete,
}: DatasetDeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const deleteDataset = useDeleteDataset();

  const canConfirm = confirmText === datasetName;

  async function handleDelete() {
    if (!datasetId || !canConfirm) return;
    try {
      await deleteDataset.mutateAsync(datasetId);
      setConfirmText("");
      onOpenChange(false);
      onComplete();
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setConfirmText("");
        onOpenChange(val);
      }}
    >
      <AlertDialogContent data-testid="dataset-delete-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{datasetName}</strong> and all{" "}
            <strong>{fileCount}</strong> associated jobs. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label>
            Type <strong>{datasetName}</strong> to confirm
          </Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Dataset name"
            data-testid="dataset-delete-confirm-input"
          />
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="dataset-delete-cancel">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canConfirm || deleteDataset.isPending}
            data-testid="dataset-delete-confirm"
          >
            {deleteDataset.isPending ? "Deleting..." : "Delete Dataset"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssignJobsBulk } from "@/features/job-assignment/api/assign-jobs-bulk";
import type { AssignmentPreview } from "@/features/job-assignment/utils/round-robin";

interface AssignmentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: AssignmentPreview[];
  type: "ANNOTATION" | "QA";
  onComplete: () => void;
}

export function AssignmentPreviewDialog({
  open,
  onOpenChange,
  preview,
  type,
  onComplete,
}: AssignmentPreviewDialogProps) {
  const assignBulk = useAssignJobsBulk();

  const totalJobs = preview.reduce((sum, p) => sum + p.jobIds.length, 0);

  async function handleConfirm() {
    const assignments = preview.flatMap((p) =>
      p.jobIds.map((jobId) => ({
        jobId,
        assigneeId: p.user.id,
      })),
    );

    await assignBulk.mutateAsync({ assignments, type });
    onOpenChange(false);
    onComplete();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Round-Robin Preview</DialogTitle>
          <DialogDescription>
            {totalJobs} jobs will be distributed across {preview.length} users.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Current</TableHead>
              <TableHead className="text-right">New</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((p) => (
              <TableRow key={p.user.id}>
                <TableCell className="font-medium">{p.user.name}</TableCell>
                <TableCell className="text-right">
                  {p.currentWorkload}
                </TableCell>
                <TableCell className="text-right">{p.jobIds.length}</TableCell>
                <TableCell className="text-right font-medium">
                  {p.newTotal}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={assignBulk.isPending}>
            {assignBulk.isPending ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUsers } from "@/features/users/api/get-users";
import { useReassignJobs } from "@/features/job-assignment/api/reassign-jobs";
import { UserRole } from "@/types/enums";

interface BulkReassignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobIds: string[];
  type: "ANNOTATION" | "QA";
  onComplete: () => void;
}

export function BulkReassignDialog({
  open,
  onOpenChange,
  jobIds,
  type,
  onComplete,
}: BulkReassignDialogProps) {
  const [newAssigneeId, setNewAssigneeId] = useState("");
  const targetRole = type === "QA" ? UserRole.QA : UserRole.ANNOTATOR;
  const { data: usersData } = useUsers({
    role: targetRole,
    status: "ACTIVE",
    pageSize: 100,
  });
  const reassignJobs = useReassignJobs();

  const users = usersData?.results ?? [];

  async function handleReassign() {
    if (!newAssigneeId) return;
    await reassignJobs.mutateAsync({
      jobIds,
      newAssigneeId,
      type,
    });
    setNewAssigneeId("");
    onOpenChange(false);
    onComplete();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="bulk-reassign-dialog">
        <DialogHeader>
          <DialogTitle>Reassign Jobs</DialogTitle>
          <DialogDescription>
            Reassign {jobIds.length} selected job{jobIds.length !== 1 ? "s" : ""}{" "}
            to a different {type === "QA" ? "QA reviewer" : "annotator"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>New Assignee</Label>
          <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
            <SelectTrigger data-testid="reassign-user-select">
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            data-testid="reassign-confirm"
            onClick={handleReassign}
            disabled={!newAssigneeId || reassignJobs.isPending}
          >
            {reassignJobs.isPending ? "Reassigning..." : "Reassign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

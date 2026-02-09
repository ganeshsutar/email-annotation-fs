import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onConfirm: (comments: string) => void;
}

export function RejectDialog({
  open,
  onOpenChange,
  isSubmitting,
  onConfirm,
}: RejectDialogProps) {
  const [comments, setComments] = useState("");

  const isValid = comments.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Annotations?</DialogTitle>
          <DialogDescription>
            This will send the job back to the annotator for rework. Please
            provide detailed feedback about what needs to be corrected.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Textarea
            placeholder="Describe what needs to be fixed (min. 10 characters)..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
          {comments.length > 0 && !isValid && (
            <p className="text-xs text-destructive mt-1">
              Comments must be at least 10 characters.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(comments)}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

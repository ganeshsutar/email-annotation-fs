import { Check, Flag, Pencil, Trash2 } from "lucide-react";
import type { WorkspaceAnnotation } from "@/types/models";
import type { AnnotationQAStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AnnotationReviewPopoverProps {
  annotation: WorkspaceAnnotation;
  status: AnnotationQAStatus;
  children: React.ReactNode;
  onMarkOK: () => void;
  onFlag: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AnnotationReviewPopover({
  annotation,
  status,
  children,
  onMarkOK,
  onFlag,
  onEdit,
  onDelete,
}: AnnotationReviewPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: annotation.classColor }}
              />
              <span className="font-medium text-sm">
                {annotation.classDisplayLabel}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {annotation.tag}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">
              &ldquo;{annotation.originalText}&rdquo;
            </p>
            <p className="text-xs text-muted-foreground">
              Offset: {annotation.startOffset}–{annotation.endOffset}
            </p>
            <p className="text-xs text-muted-foreground">
              Status: <span className="font-medium">{status}</span>
            </p>
          </div>
          <div className="flex gap-1 border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={onMarkOK}
            >
              <Check className="h-3 w-3 mr-1" /> OK
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
              onClick={onFlag}
            >
              <Flag className="h-3 w-3 mr-1" /> Flag
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7"
              onClick={onEdit}
            >
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

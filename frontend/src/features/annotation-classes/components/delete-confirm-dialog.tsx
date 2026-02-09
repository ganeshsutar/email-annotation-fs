import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAnnotationClassUsage } from "@/features/annotation-classes/api/get-annotation-class-usage";
import { useDeleteAnnotationClass } from "@/features/annotation-classes/api/delete-annotation-class";
import type { AnnotationClass } from "@/types/models";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotationClass: AnnotationClass | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  annotationClass,
}: DeleteConfirmDialogProps) {
  const { data: usage } = useAnnotationClassUsage(
    open ? annotationClass?.id ?? null : null,
  );
  const deleteClass = useDeleteAnnotationClass();

  async function handleConfirm() {
    if (!annotationClass) return;
    await deleteClass.mutateAsync(annotationClass.id);
    onOpenChange(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete &ldquo;{annotationClass?.displayLabel}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {usage && usage.annotationCount > 0 ? (
              <>
                This class is used in{" "}
                <strong>
                  {usage.annotationCount} annotation
                  {usage.annotationCount !== 1 ? "s" : ""}
                </strong>
                . Existing annotations will keep their class name, but this
                class will no longer be available for new annotations.
              </>
            ) : (
              "This annotation class will be removed from the available options."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteClass.isPending}
          >
            {deleteClass.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

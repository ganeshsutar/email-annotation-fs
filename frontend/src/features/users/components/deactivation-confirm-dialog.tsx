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
import { useUserJobImpact } from "@/features/users/api/get-user-job-impact";
import { useDeactivateUser } from "@/features/users/api/deactivate-user";
import type { User } from "@/types/models";

interface DeactivationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onComplete: () => void;
}

export function DeactivationConfirmDialog({
  open,
  onOpenChange,
  user,
  onComplete,
}: DeactivationConfirmDialogProps) {
  const { data: jobImpact } = useUserJobImpact(open ? user?.id ?? null : null);
  const deactivateUser = useDeactivateUser();

  async function handleConfirm() {
    if (!user) return;
    await deactivateUser.mutateAsync(user.id);
    onOpenChange(false);
    onComplete();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {user?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This user will no longer be able to sign in.
            {jobImpact && jobImpact.total > 0 && (
              <>
                {" "}
                They have{" "}
                <strong>{jobImpact.total} assigned job(s)</strong> that
                will be unassigned.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deactivateUser.isPending}
          >
            {deactivateUser.isPending ? "Deactivating..." : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

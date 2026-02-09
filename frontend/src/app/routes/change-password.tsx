import { createFileRoute, redirect } from "@tanstack/react-router";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { currentUserQueryOptions } from "@/features/auth/api/get-current-user";

export const Route = createFileRoute("/change-password")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(currentUserQueryOptions());
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: ChangePasswordPage,
});

function ChangePasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <ChangePasswordForm />
    </div>
  );
}

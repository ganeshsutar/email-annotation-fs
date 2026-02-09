import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { currentUserQueryOptions } from "@/features/auth/api/get-current-user";
import { UserRole } from "@/types/enums";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context }) => {
    let user;
    try {
      user = await context.queryClient.ensureQueryData(
        currentUserQueryOptions(),
      );
    } catch {
      throw redirect({ to: "/login" });
    }

    if (user.forcePasswordChange) {
      throw redirect({ to: "/change-password" });
    }

    if (user.role !== UserRole.ADMIN) {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: AdminLayout,
});

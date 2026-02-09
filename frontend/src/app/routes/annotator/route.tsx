import { createFileRoute, redirect } from "@tanstack/react-router";
import { AnnotatorLayout } from "@/components/layouts/annotator-layout";
import { currentUserQueryOptions } from "@/features/auth/api/get-current-user";
import { UserRole } from "@/types/enums";

export const Route = createFileRoute("/annotator")({
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

    if (user.role !== UserRole.ANNOTATOR) {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: AnnotatorLayout,
});

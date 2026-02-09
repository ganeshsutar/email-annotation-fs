import { createFileRoute, isRedirect, redirect } from "@tanstack/react-router";
import { currentUserQueryOptions } from "@/features/auth/api/get-current-user";
import { getDashboardPath } from "@/lib/authorization";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    try {
      const user = await context.queryClient.ensureQueryData(
        currentUserQueryOptions(),
      );
      throw redirect({ to: getDashboardPath(user.role) });
    } catch (err) {
      if (isRedirect(err)) throw err;
      throw redirect({ to: "/login" });
    }
  },
});

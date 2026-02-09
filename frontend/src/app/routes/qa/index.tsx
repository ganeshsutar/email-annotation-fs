import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/qa/")({
  beforeLoad: () => {
    throw redirect({ to: "/qa/dashboard" });
  },
});
